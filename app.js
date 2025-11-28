const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const User = require('./models/User');
const Food = require('./models/Food');

const app = express();

// ---Configuration ---
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));

// --- 2. database connection ---
// MongoDB
// --- 2. database connection ---
// MongoDB Atlas (Cloud)
const dbURI = 'mongodb+srv://jingdarrell_db_user:student123@cluster0.dwcnzaj.mongodb.net/?appName=Cluster0';

mongoose.connect(dbURI)
    .then(() => console.log('MongoDB Connected to Atlas!'))
    .catch(err => console.log('Connection Error:', err));

// ---Routes---

//Home Page - Login Page
app.get('/', (req, res) => {
    res.render('login');
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
        res.send('Invalid login details. <a href="/">Try again</a>');
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
app.post('/add-food', async (req, res) => {
    if (!req.session.user || req.session.user.userType !== 'donor') return res.redirect('/');
    
    await Food.create({
        name: req.body.name,
        description: req.body.description,
        expiryDate: req.body.expiryDate,
        quantity: req.body.quantity,
        donor: req.session.user._id
    });
    res.redirect('/dashboard');
});

// User: Reserve food
// User: 预订食物 (支持选择数量)
app.post('/reserve/:id', async (req, res) => {
    if (!req.session.user) return res.redirect('/');

    try {
        const foodId = req.params.id;
        const requestedQty = parseInt(req.body.reserveQty); // 获取用户输入的数量
        const currentUser = req.session.user;

        // 1. 找到该食物
        const food = await Food.findById(foodId);

        if (!food || food.status !== 'Available') {
            return res.redirect('/dashboard'); // 防止重复预订
        }

        // 2. 逻辑判断
        if (requestedQty >= food.quantity) {
            //情况 A: 用户全都要了 (或者输入的比库存还多) -> 直接标记原物品为 Reserved
            food.status = 'Reserved';
            food.reservedBy = currentUser._id;
            await food.save();
        } else {
            // 情况 B: 用户只拿一部分 -> 拆分逻辑
            
            // B1. 创建一个新的“已预订”条目给这个用户
            await Food.create({
                name: food.name,
                description: food.description,
                expiryDate: food.expiryDate,
                quantity: requestedQty, // 只有用户要的数量
                donor: food.donor,      // 还是同一个餐厅提供的
                status: 'Reserved',
                reservedBy: currentUser._id
            });

            // B2. 减少原条目的库存
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

// Start the server
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});