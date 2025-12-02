const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const User = require('./models/User');
const Food = require('./models/Food');
const multer = require('multer');
const path = require('path');

// --- Multer 配置 (限制文件大小 1MB) ---
const storage = multer.memoryStorage(); // 直接存内存，不存硬盘
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 } // 限制 1MB，防止数据库爆炸
});

const app = express();
require('dotenv').config();
// ---Configuration ---
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));

// --- 2. database connection ---
// MongoDB
// --- 2. database connection ---
// MongoDB Atlas (Cloud)
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI)
    .then(() => console.log('MongoDB Connected to Atlas!'))
    .catch(err => console.log('Connection Error:', err));

// ---Routes---

//Home Page - Login Page
app.get('/', (req, res) => {
    res.render('login',{error:null});
});

// login logical
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    //  search for users
    const user = await User.findOne({ email, password });
    if (user) {
        req.session.user = user; // Save the login status
        res.redirect('/dashboard');
    } else {
        res.render('login', { error: 'Invalid email or password. Please try again.' });
    }
});

// Registration logic (Quickly create a test account)
app.post('/register', async (req, res) => {
    const { name, email, password, userType } = req.body;
    await User.create({ name, email, password, userType });
    res.redirect('/');
});

//Dashboard (Core Page)
app.get('/dashboard', async (req, res) => {
    if (!req.session.user) return res.redirect('/');
    
    const currentUser = req.session.user;

    if (currentUser.userType === 'donor') {
        // If it is a Donor, it shows the food it has published itself
        const myFoods = await Food.find({ donor: currentUser._id }).populate('reservedBy');
        res.render('dashboard', { user: currentUser, foods: myFoods,myReservations:[]});
    }  else {
        // --- 如果是 User (学生/领取者) ---
        
        // 1. 获取搜索关键词 (如果有的话)
        const searchQuery = req.query.search || '';

        // 2. 构建查询条件
        // status 必须是 'Available'
        // name 使用正则匹配 (regex) 实现模糊搜索，'i' 表示忽略大小写
        const searchFilter = { 
            status: 'Available',
            name: { $regex: searchQuery, $options: 'i' } 
        };

        // 3. 执行查询
        const availableFoods = await Food.find(searchFilter).populate('donor');
        
        // 4. 查找“我预订过”的食物
        const myReservations = await Food.find({ reservedBy: currentUser._id }).populate('donor');
        
        // 5. 渲染页面 (把 searchQuery 也传回去，为了让搜索框保留输入的词)
        res.render('dashboard', { 
            user: currentUser, 
            foods: availableFoods, 
            myReservations: myReservations,
            searchQuery: searchQuery 
        });
    }});

// Donor: Publishes food
// Donor: Publishes food (支持图片上传)
app.post('/add-food', upload.single('imageFile'), async (req, res) => {
    if (!req.session.user || req.session.user.userType !== 'donor') return res.redirect('/');

    let finalImageUrl = '';

    // 逻辑：如果用户上传了图片，就用上传的；否则根据类别自动配图
    if (req.file) {
        // 把图片 buffer 转换成 Base64 字符串
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const mimeType = req.file.mimetype; // e.g., image/jpeg
        finalImageUrl = `data:${mimeType};base64,${b64}`;
    } else {
        // 如果没上传，使用类别默认图 (这里为了演示，留空让前端 EJS 去处理默认图，或者你在这里填入默认 URL)
        // 为了简单，我们存空字符串，让前端 EJS 决定显示什么
        finalImageUrl = ''; 
    }

    await Food.create({
        name: req.body.name,
        description: req.body.description,
        expiryDate: req.body.expiryDate,
        quantity: req.body.quantity,
        category: req.body.category || 'Other',
        imageUrl: finalImageUrl, // 存入 Base64 字符串
        donor: req.session.user._id
    });
    res.redirect('/dashboard');
});

// User: Reserve food (支持数量选择，修复了图片/类别丢失的 Bug)
app.post('/reserve/:id', async (req, res) => {
    if (!req.session.user) return res.redirect('/');

    try {
        const foodId = req.params.id;
        const requestedQty = parseInt(req.body.reserveQty);
        const currentUser = req.session.user;

        const food = await Food.findById(foodId);

        if (!food || food.status !== 'Available') {
            return res.redirect('/dashboard');
        }

        if (requestedQty >= food.quantity) {
            // 情况 A: 全拿走了 -> 直接改状态 (图片和类别本来就在，不用动)
            food.status = 'Reserved';
            food.reservedBy = currentUser._id;
            await food.save();
        } else {
            // 情况 B: 只拿一部分 -> 创建新条目 (拆分)
            await Food.create({
                name: food.name,
                description: food.description,
                expiryDate: food.expiryDate,
                quantity: requestedQty,
                donor: food.donor,
                status: 'Reserved',
                reservedBy: currentUser._id,
                
                // 🔥【修复关键点】这里必须把原食物的 类别 和 图片 也复制过去！
                category: food.category,
                imageUrl: food.imageUrl
            });

            // 减少原条目的库存
            food.quantity = food.quantity - requestedQty;
            await food.save();
        }

        res.redirect('/dashboard');
    } catch (err) {
        console.log(err);
        res.redirect('/dashboard');
    }
});

// log out
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Donor: Mark as picked up (Complete order)
    app.post('/mark-picked-up/:id', async (req, res) => {
    // Security Check: Only Donor can be operated
    if (!req.session.user || req.session.user.userType !== 'donor') return res.redirect('/');
    
    await Food.findByIdAndUpdate(req.params.id, { status: 'Picked Up' });
    res.redirect('/dashboard');
});

// Donor: Delete the posted food
app.post('/delete-food/:id', async (req, res) => {
    if (!req.session.user || req.session.user.userType !== 'donor') return res.redirect('/');
    
    await Food.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard');
});

// User: 提交评价 (Leave Review)
app.post('/review/:id', async (req, res) => {
    if (!req.session.user) return res.redirect('/');
    
    // 获取评分和评论内容
    const { rating, reviewComment } = req.body;
    
    // 更新数据库
    await Food.findByIdAndUpdate(req.params.id, {
        rating: rating,
        reviewComment: reviewComment
    });
    
    res.redirect('/dashboard');
});

// --- New Route: Skip Review ---
// Allow users to skip the review process
app.post('/skip-review/:id', async (req, res) => {
    if (!req.session.user) return res.redirect('/');
    
    // Set rating to -1 to indicate "Skipped" (0 is pending, -1 is skipped, 1-5 is rated)
    await Food.findByIdAndUpdate(req.params.id, { rating: -1 });
    
    res.redirect('/dashboard');
});

// User: Cancel reservation or delete history
// 用户取消预订或删除历史记录 (包含库存恢复逻辑)
app.post('/delete-reservation/:id', async (req, res) => {
    if (!req.session.user) return res.redirect('/');
    
    try {
        // 1. 找到这条订单
        const reservation = await Food.findById(req.params.id);
        
        // 安全检查：防止报错
        if (!reservation) return res.redirect('/dashboard');

        // === 情况 A: 取消正在进行的预订 (Active) ===
        // 我们需要把库存“还回去”
        if (reservation.status === 'Reserved') {
            
            // 尝试找到原始的“Available”条目 (同名、同卖家、同日期)
            const originalFood = await Food.findOne({
                name: reservation.name,
                donor: reservation.donor,
                expiryDate: reservation.expiryDate,
                status: 'Available'
            });

            if (originalFood) {
                // 如果找到了原始条目：把数量加回去
                originalFood.quantity += reservation.quantity;
                await originalFood.save();
                
                // 然后删除当前这个拆分出来的订单
                await Food.findByIdAndDelete(req.params.id);
            } else {
                // 如果没找到 (可能之前刚好卖光了，或者原始条目被删了)
                // 直接把当前这个订单变回 "Available"
                reservation.status = 'Available';
                reservation.reservedBy = null; // 清空预订人
                await reservation.save();
            }
        } 
        
        // === 情况 B: 删除历史记录 (Picked Up) ===
        // 食物已经被取走了，不需要恢复库存，直接删除记录清理界面
        else {
            await Food.findByIdAndDelete(req.params.id);
        }

        res.redirect('/dashboard');

    } catch (err) {
        console.log("Error canceling reservation:", err);
        res.redirect('/dashboard');
    }
});

// --- New Feature: Public Donor Profile & Reviews ---
app.get('/donor-reviews/:id', async (req, res) => {
    //需要登录
    if (!req.session.user) return res.redirect('/');

    try {
        const donorId = req.params.id;

        // 1. 获取商家信息 (只为了显示名字)
        const donor = await User.findById(donorId);

        // 2. 获取该商家所有 已评分 (rating > 0) 的食物记录
        // 注意：这里不需要 populate('reservedBy')，因为我们要匿名
        const reviews = await Food.find({ 
            donor: donorId, 
            rating: { $gt: 0 } // 只找大于0分的（也就是已评价的）
        }).sort({ _id: -1 }); // 最新的评价排前面

        // 3. 渲染新页面
        res.render('reviews', { 
            user: req.session.user, // 为了 header 显示
            donor: donor, 
            reviews: reviews 
        });

    } catch (err) {
        console.log(err);
        res.redirect('/dashboard');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});