import TryCatch from "../middlewares/tryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { rm } from 'fs'
import { promisify } from "util";
import fs from 'fs'
import {User} from '../models/user.js'
import { Payment } from "../models/Payment.js";

export const createCourse = TryCatch(async(req,res)=>{
    const { title, description, category, createdBy, duration, price} = req.body

    const image = req.file;

    await Courses.create({
        title,
        description,
        category,
        createdBy,
        image: image?.path,
        duration,
        price,
    });

    res.status(201).json({
        message: "Course Created Successfully",
    });

});

export const addLectures = TryCatch(async(req,res)=>{
    const course = await Courses.findById(req.params.id)

    if(!course) return res.status(404).json({
        message: "No Course with this ID",
    });

    const {title,description} =req.body

    const file = req.file

    const lecture = await Lecture.create({
        title,
        description,
        video: file?.path,
        course: course._id,
    });

    res.status(201).json({
        message:"Lecture Added",
        lecture,
    });
});

export const deleteLecture = TryCatch(async(req,res)=>{
    const lecture = await Lecture.findById(req.params.id)

    rm(lecture.video, () =>{
        console.log("Video Deleted");
    });

    await lecture.deleteOne();

    res.json({
        message: "Lecture Deleted"
    });
});

const unlinkAsync = promisify(fs.unlink)

export const deleteCourse = TryCatch(async(req,res)=>{
    const course = await Courses.findById(req.params.id)

    const lectures = await Lecture.find({course: course._id})

    await Promise.all(
        lectures.map(async(lecture)=>{
            await unlinkAsync(lecture.video);
            console.log("Video Deleted");
        })
    );

    rm(course.image,() =>{
        console.log("Image Deleted");
    });

    await Lecture.find({course: req.params.id}).deleteMany()

    await course.deleteOne()

    await User.updateMany({},{$pull: {subscription: req.params.id }});

    res.json({
        message: "Course Deleted"
    })
    
});

export const getAllStats = TryCatch(async(req,res) =>{
    const totalCourses = (await Courses.find()).length;
    const totalLectures = (await Lecture.find()).length;
    const totalUser = (await User.find()).length;
    const totalPayments = (await Payment.find()).length;

    const stats = {
        totalCourses,
        totalLectures,
        totalUser,
        totalPayments,
    };

    res.json({
        stats,
    });
});

export const getAllUser = TryCatch(async(req,res)=>{
    const users = await User.find({_id:{$ne: req.user._id}}).select("-password");

    res.json({users});
});

export const updateRole = TryCatch(async(req,res)=>{
    const user = await User.findById(req.params.id);

    if(user.role === "user"){
        user.role = "admin";
        await user.save()

        return res.status(200).json({
            message: "Role updated to admin"
        })
    }

    if(user.role === "admin"){
        user.role = "user";
        await user.save()

        return res.status(200).json({
            message: "Role updated"
        })
    }
})