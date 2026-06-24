import mongoose from "mongoose";
const MONGODB_URI=process.env.MONGODB_URI;
if(!MONGODB_URI){throw new Error("Please add MONGODB_URI to .env.local");}
type Cache={conn:typeof mongoose|null;promise:Promise<typeof mongoose>|null};
declare global{var mongooseCache:Cache|undefined}
const cached:Cache=global.mongooseCache||{conn:null,promise:null};
if(!global.mongooseCache)global.mongooseCache=cached;
export async function connectMongoDB(){if(cached.conn)return cached.conn;if(!cached.promise)cached.promise=mongoose.connect(MONGODB_URI as string);cached.conn=await cached.promise;return cached.conn;}
