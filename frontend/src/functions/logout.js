export const logout = ()=>{
    localStorage.removeItem("authtoken")
    localStorage.removeItem("userId" )
    localStorage.removeItem("baseFolderPath")
    localStorage.removeItem("folderPath")
    localStorage.removeItem("seen")
    localStorage.removeItem("unseen")
}