const mongoose = require('mongoose')


// connnect mongoDB
const dbUrl = 'mongodb://localhost:27017/productDB'

mongoose.connect(dbUrl,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).catch(err=>console.log(err))


/// ออกแบบ schema
let productSchema = mongoose.Schema({
    name:String,
    price:Number,
    image:String,
    detail:String
})

// create model
let Product = mongoose.model("products",productSchema)

module.exports = Product




