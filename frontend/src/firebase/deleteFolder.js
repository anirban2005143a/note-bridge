import { storage } from "./config";
import { ref , deleteObject } from "firebase/storage";

export const deleteFolderFromFirebase = async()=>{
    const storageRef = storage.ref();
    storageRef.child('images').delete();
}