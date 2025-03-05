import { storage } from "./config";
import { ref , deleteObject } from "firebase/storage";

export const deleteFileFromFirebase = async (path)=>{
    const fileref = ref(storage, path);
    try {
        await deleteObject(fileref)
        return true
    } catch (error) {
        return error.message
    }
}