import express from 'express';
import { getAllCourses, getSingleCourse, fetchLectures, fetchLecture, checkout, paymentVerification, } from '../controllers/course.js';
import {isAuth} from '../middlewares/isAuth.js'


const router = express.Router();

router.get("/course/all", getAllCourses);
router.get("/course/:id", getSingleCourse);
router.get("/lectures/:id", isAuth, fetchLectures);
router.get("/lecture/:id", isAuth, fetchLecture);
router.post("/course/checkout/:id", isAuth, checkout);
router.post("/verification/:id", isAuth, paymentVerification);

export default router;