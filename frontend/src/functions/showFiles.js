export const showFiles = (url, desc) => {
  if (url) {
    window.open(url, "_blank");
  }
  if (desc) {
    var textContent = desc;
    var newWindow = window.open("", "_blank", "width=600,height=400");
    newWindow.document.write(
      "<div style='overflow-y: auto; height: auto;margin: 20px;line-height: 30px;'>" + textContent + "</div>"
    );
  }
};
