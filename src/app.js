import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import prodsRouter from "./routes/products.routes.js";
import rtpRouter from "./routes/realtimeproducts.routes.js";
// import cartsRouter from "../routes/carts.routes.js";


import __dirname from "./dirname.js";
import ProductManager from "./models/ProductManager.js";

const manager1 = new ProductManager()

const app = express()
const PORT = 8080


const httpServer = app.listen(PORT,()=>console.log(`Servidor conectado al puerto: ${PORT}`))
const socketServer = new Server(httpServer)

app.use(express.json())
app.use(express.urlencoded({extended:true}))

//sin HBS!
// app.use('/api/products', prodsRouter)
// app.use('/api/carts', cartsRouter)

//config HBS!
app.engine('handlebars',handlebars.engine());
app.set('views',__dirname+'/views')
app.set('view engine','handlebars');
app.use(express.static(__dirname+'/public'))

//vistas HBS!
app.use('/',prodsRouter)
app.use('/realtimeproducts',rtpRouter)

//conexiones Socket IO!
socketServer.on('connection', socket=>{
    console.log("Nuevo cliente conectado")
    
    socket.on('showprods', data =>{
        console.log(data)
        const productos = manager1.getProducts();
        socket.emit('message-showprods', productos)
    })

    socket.on('agregarProd', nuevoProducto=>{
        console.log("Solicitud de añadir producto:");
        console.table(nuevoProducto);
        manager1.addProduct(nuevoProducto);
        const productos = manager1.getProducts();
        socket.emit('message-showprods', productos)
    })

    socket.on('elimProd', IDaElim =>{
        console.log("Solicitud de eliminar producto con ID:");
        console.table(IDaElim);
        manager1.deleteProductById(IDaElim);
        const productos = manager1.getProducts();
        socket.emit('message-showprods', productos)
    })
})