import {NextResponse} from "next/server";
import {connectMongoDB} from "@/lib/mongodb";
import ProductModel from "@/models/Product";
export async function GET(){try{await connectMongoDB();const products=await ProductModel.find().sort({createdAt:-1});return NextResponse.json(products);}catch(error){return NextResponse.json({message:"Failed to fetch products",error},{status:500});}}
export async function POST(request:Request){try{const body=await request.json();await connectMongoDB();const product=await ProductModel.create(body);return NextResponse.json(product,{status:201});}catch(error){return NextResponse.json({message:"Failed to create product",error},{status:500});}}
