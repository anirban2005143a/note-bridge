import React, { useEffect, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import io from "socket.io-client";
import NoteContext from "../context/notes/noteContext";
import Navbar from './navbar'
import '../css/about.css'

const about = () => {
    const location = useLocation();

    const value = useContext(NoteContext);
    const socket = io(`${value.host}`);


    const [like, setlike] = useState(false)
    const [view, setview] = useState(false)
    const [follow, setfollow] = useState(false)
    const [comments, setcomments] = useState([])
    const [isNavbaeShow, setisNavbaeShow] = useState(false)

    useEffect(() => {
        socket.emit("userConnected", `${value.userId}`); //connect to io

        //get accept req status
        socket.on("acceptReq", (data) => {
            setfollow(!follow);
        });
        //socket reply of followReqStatus
        socket.on("postComment", (data) => {
            setcomments(data)
        });
        //get accept req status
        socket.on("denyReq", (data) => {
            setfollow(!follow);
        });
        //socket reply for likes
        socket.on("postLike", (data) => {
            setlike(!like)
        });

        //socket reply of view request status
        socket.on("viewReq", (data) => {
            setview(!view);
        });

        //socket reply of followReqStatus
        socket.on("followReqStatus", (data) => {
            setfollow(!follow);
        });
    }, [])

    useEffect(() => {
        value.fetchNotificationToRead()
    }, [follow, comments, like, view])

    useEffect(() => {
        window.innerWidth <= 625 ? setisNavbaeShow(true) : setisNavbaeShow(false)
    }, [])

    window.addEventListener('resize', () => {
        window.innerWidth <= 625 ? setisNavbaeShow(true) : setisNavbaeShow(false)
    })

    return (
        <>

            <div className="container-fluid h-100" id="about">

                {isNavbaeShow && <Navbar search={() => { }} />}
                    
                <div className="w-100">
                    <div className="w-100">
                        <div className="text-center mb-5">
                            <h1 className="text-primary mb-4 fw-bold aboutHeading">NoteBridge</h1>
                            <div className="wave-background">
                                <div className="wave"></div>
                            </div>
                        </div>
                        <div className="card1 mb-3 shadow rounded-3">
                            <div className="card-body  fs-5 rounded p-sm-4 py-4 px-3">
                                <p>Welcome to NoteBridge, a groundbreaking MERN-based project that serves as a comprehensive file management and social networking platform. As our inaugural venture into the realm of web development, NoteBridge represents a culmination of passion, innovation, and countless hours of dedication.</p>
                            </div>
                        </div>
                        <div className="card2 mb-4 shadow rounded-3">
                            <div className="card-body rounded p-1 p-sm-4">
                                <h2 className=" heading text-primary mb-3 ms-2 ms-sm-0 mt-2 mt-sm-0">Key Features:</h2>
                                <ul className="m-0 p-2">
                                    <li className="list-group-item p-2"><span className=' me-2 fw-bold fs-5'>User Management:</span> Seamlessly create, login, and logout of your account. Update your profile information, set or change your profile image, and keep track of important dates such as account creation, last login, and last update.</li>
                                    <li className="list-group-item p-2"><span className=' me-2 fw-bold fs-5'>Social Interaction:</span> Engage with other users through a range of social features. Send follow requests, request to view posts, like and comment on posts, and explore user profiles by clicking on their profile images. Stay updated with notifications for new followers, comments, likes, and view requests, allowing you to promptly respond and engage with your community.</li>
                                    <li className="list-group-item p-2"><span className=' me-2 fw-bold fs-5'>File Management:</span> Effortlessly organize your files with our intuitive file management system. Create folders, upload files, and navigate through nested folders with ease. Delete individual files, folders, or entire folder structures effortlessly.</li>
                                    <li className="list-group-item p-2"><span className=' me-2 fw-bold fs-5'>Search Functionality:</span> Discover relevant content quickly and efficiently with our powerful search feature. Search through all posts with ease, filtering results based on keywords present in post descriptions.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="card3 mb-4 shadow rounded-3">
                            <div className="card-body rounded p-1 p-sm-4">
                                <h2 className=" heading text-primary mb-3 ms-2 ms-sm-0 mt-2 mt-sm-0">Additional Features:</h2>
                                <ul className="m-0 p-2">
                                    <li className="list-group-item p-2"><span className=' fw-bold fs-5'>Social Interaction Enhancements:</span>
                                        <ul className=" my-2" >
                                            <li className="list-group-item p-2">🔷 When receiving follow or view requests, users can directly navigate to the profile of the requester.</li>
                                            <li className="list-group-item p-2">🔷 Users receive notifications for comments on their posts, facilitating quick access to the specific post for interaction.</li>
                                            <li className="list-group-item p-2">🔷 Each post displays the total number of likes and comments, enabling users to gauge engagement at a glance.</li>
                                            <li className="list-group-item p-2">🔷 Sharing functionality allows users to disseminate posts via popular social media platforms like WhatsApp and Facebook.</li>
                                        </ul>
                                    </li>
                                    <li className="list-group-item p-2"><span className=' fw-bold fs-5'>Enhanced File Management:</span>
                                        <ul className=" my-2">
                                            <li className="list-group-item p-2" >🔷 The file-sharing feature enables users to share files seamlessly via social media platforms, promoting collaboration and ease of access.</li>
                                            <li className="list-group-item p-2" >🔷 The platform is fully responsive, ensuring optimal usability across various devices, including smartphones. While usable on smaller screens, the experience is optimized for larger displays.</li>
                                            <li className="list-group-item p-2" >🔷 A skeleton loader ensures a smooth loading experience, preventing frustration when content is being fetched. This loader is implemented in both the post and notification sections.</li>
                                            <li className="list-group-item p-2" >🔷 Real-time notifications alert users of interactions such as post likes without requiring a page refresh. A pulsating red dot atop the notification icon signals new activity, while notification messages appear in the top corner of the screen for immediate attention.</li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="card4 mb-4 shadow rounded-3">
                            <div className="card-body rounded  p-1 p-sm-4">
                                <h2 className=" heading text-primary mb-3 ms-2 ms-sm-0 mt-2 mt-sm-0">Tech Stack:</h2>
                                <ul className="m-0 p-2">
                                    <li className="list-group-item p-2"><span className=' me-2 fw-bold fs-5'>Frontend:</span> Built with React and enhanced with Bootstrap for a sleek and responsive user interface.</li>
                                    <li className="list-group-item p-2"><span className=' me-2 fw-bold fs-5'>Real-time Communication:</span> Implemented with Socket.IO for instant notifications and seamless interaction.</li>
                                    <li className="list-group-item p-2"><span className=' me-2 fw-bold fs-5'>Backend:</span> Powered by MongoDB, Express, and Node.js for robust data storage and retrieval.</li>
                                    <li className="list-group-item p-2"><span className=' me-2 fw-bold fs-5'>Storage:</span> Utilizing Firebase for efficient file storage and retrieval.</li>
                                </ul>
                            </div>
                        </div>
                        <div className=' text-white disclaimer'>
                            <p className='fw-bold fs-5 text-info'>Disclaimer:</p>
                            <p>Please note that for the best user experience, we recommend accessing our platform via desktop or laptop devices. Additionally, ensure a stable internet connection to avoid interruptions in service, particularly when engaging in real-time communication features. We appreciate your understanding as we continue to enhance and optimize our platform for a seamless user experience.

                                For a better understanding, please explore our web application firsthand, and don't hesitate to reach out with any feedback or suggestions for improvement. Thank you for being a part of our journey!</p>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
}

export default about;
