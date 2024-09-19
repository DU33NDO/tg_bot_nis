import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const connectDB = async () => {
  try {
    await prisma.$connect()
    console.log('Database connected...')
  } catch (err: any) {
    console.error('Error connecting to database:', err.message)
    process.exit(1)
  }
}

export default connectDB