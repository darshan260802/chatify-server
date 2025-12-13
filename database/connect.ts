import mongoose from "mongoose";


export default function connectToMongoDB(url: string, config: mongoose.ConnectOptions){
    return mongoose.connect(url, config)
}