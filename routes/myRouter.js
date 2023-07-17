const express = require('express')
const router = express.Router()
const fs = require('fs');
const path = require('path')


/// เรียก model
const Product = require('../models/products')

///อัพโหลดไฟล
const multer = require('multer')

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/images/products') //ตำแหน่งเก็บไฟล์

    },
    filename:function(req,file,cb){
        cb(null,Date.now()+'.jpg') //เปลี่ยนชื่อไฟล ป้องกันชื่อซ้ำ

    }
})

///upload
const upload = multer({
    storage:storage
})


router.get('/', async (req, res) => {
    try {
      const documents = await Product.find();
      res.render('index', { products: documents });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
  
    // const products = 
    // [
    //     { name: "โน๊ตบุค", price: "150000", image: "images/products/product1.png" },
    //     { name: "เสื้อกันหนาว", price: "1500", image: "images/products/product2.png" },
    //     { name: "หูฟัง", price: "500", image: "images/products/product3.png" }
    // ]
    //res.render('index.ejs', { products: products })

router.get('/add-product', (req, res) => {
    if(req.session.login){
        res.render('form')
    }else{
        res.render('admin')
    }
//     if(req.cookies.login){
//         res.render('form')
//     }else{
//         res.render('admin')
//     }
})


router.get('/manage',async (req, res) => {
    if(req.session.login){
        try{
            const document = await Product.find()
            res.render('manage',{products:document})
        }catch{
            console.error(err)
            res.status.send('404')

            }
            
    }else{
        res.render('admin')
    }
            
})
    // if(req.cookies.login){
    //     try{
    //         const documents = await Product.find()
    //         res.render('manage', {products:documents})
    //     }catch{
    //         console.error(err)
    //         res.status(500).send('Internal Server Error')
    
    //     }
    // }else{
    //     res.render('admin')
    // }
    
//})

// router.get('/logout',(req,res)=>{
//     res.clearCookie('username')
//     res.clearCookie('password')
//     res.clearCookie('login')
//     res.redirect('/manage')
// })

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/manage');
    });
});


//ลบข้อมูล
router.get('/delete/:id',async(req,res)=>{
    const id = req.params.id
    try{
        await Product.findByIdAndDelete(id)
        res.redirect('/manage')
    }catch (err){
        console.err(err)
        res.status(500).send('Internal Server Error')
    }
    
})
//คลิ๊กไอดีข้อมูล
router.get('/:id', async (req, res) => {
    const product_id = req.params.id;
    
    //console.log(product_id);

    try {
        const document = await Product.findOne({ _id: product_id });
        //console.log(doc);
        res.render('product',{ product:document});
    } catch (err) {
        res.render('404');
    }
});





//// เพิ่มข้อมูล
router.post('/inserts',upload.single("image"),(req, res) => {
    let data = new Product({
        name: req.body.name,
        price: req.body.price,
        image: req.file.filename,
        detail: req.body.detail,
    })
    //console.log(req.file)
    //console.log(data)
    data.save()
    .then(() => {
      res.redirect('/');
    })
    .catch(err => {
      console.log(err);
    });
});




///เรียกข้อมูลที่จะแก้ไขมาก่อน
router.post('/edit', async (req,res)=>{
    const edit_id = req.body.edit_id
    try {
        const doc = await Product.findOne({_id:edit_id});
        //console.log(doc);
        res.render('edit', { product: doc });
    } catch (err) {
        console.log(err);
    }
})

// อัพเดทข้อมูล
// router.post('/update', async (req, res) => {
//     const updateId = req.body.update_id;

//     let updatedData = {
//         name: req.body.name,
//         price: req.body.price,
//         detail: req.body.detail,
//     };
//     try {
//         await Product.findByIdAndUpdate(updateId, updatedData, { useFindAndModify: false });
//         res.redirect('/');
//     } catch (err) {
//         console.log(err);
//     }
// });


//อัพเดทข้อมูล
router.post('/update', upload.single("image"), async (req, res) => {
    const updateId = req.body.update_id;

    let updatedData = {
        name: req.body.name,
        price: req.body.price,
        detail: req.body.detail,
    };

    if (req.file) {
        // ลบรูปเก่าออก
        const product = await Product.findById(updateId);
        if (product.image) {
            const imagePath = path.join(__dirname, '../public/images/products', product.image);
            fs.unlinkSync(imagePath);
            console.log('รูปเก่าถูกลบแล้ว');
        }

        updatedData.image = req.file.filename;
    }

    try {
        await Product.findByIdAndUpdate(updateId, updatedData, { useFindAndModify: false });
        res.redirect('/');
    } catch (err) {
        console.log(err);
    }
});

router.post('/login',(req,res)=>{
    const username = req.body.username
    const password = req.body.password
    const timeExpire = 1000000 //10วิ
    if(username === 'admin' && password === "123"){
        //สร้าง session
        req.session.username = username
        req.session.password = password
        req.session.login = true
        req.session.cookie.maxAge=timeExpire
        res.redirect('/manage')
        ///สร้าง cookie
        // res.cookie('username',username,{maxAge:timeExpire})
        // res.cookie('password',username,{maxAge:timeExpire})
        // res.cookie('login',true,{maxAge:timeExpire}) ///true login
        // res.redirect('/manage')

    }else{
        res.render('404')
    }
})




module.exports = router