import { NextResponse } from 'next/server'
import connectDB from '@/app/lib/db'
import Task from '@/app/models/Task'

export async function GET() {
  await connectDB()
  const tasks = await Task.find().sort({ createdAt: -1 })
  return NextResponse.json(tasks)
}

export async function POST(req) {  // Must use req: Request or NextRequest
  try {
    console.log('POST received');  // Add this
    await connectDB();
    console.log('DB connected');  // Add this
    
    const body = await req.json();  // Use req.json(), not req.body directly
    console.log('Payload body:', body);  // Add this
    
    const task = await Task.create(body);
    console.log('Task created:', task._id);  // Add this
    
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);  // Add detailed logging
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function DELETE(req) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID missing' },
        { status: 400 }
      )
    }

    await Task.findByIdAndDelete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE ERROR:', error)
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    )
  }
}
export async function PUT(req) {
  await connectDB()
  const { id, status } = await req.json()

  const updated = await Task.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  )

  return NextResponse.json(updated)
}
