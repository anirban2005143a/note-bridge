import { storage } from "./config";
import { ref, getDownloadURL,listAll ,  uploadBytes  } from "firebase/storage";

export const retrieveFileFromFirebase = async (name)=>{
    const url = await getDownloadURL(ref(storage , `profile/${name}`))
    return url
}