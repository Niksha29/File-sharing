import React, { useState } from "react";
import axios from "axios";
import "./FileUpload.css";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [downloadLink, setDownloadLink] = useState("");
  const [emailData, setEmailData] = useState({ fromEmail: "", toEmail: "" });
  const [showSharingContainer, setShowSharingContainer] = useState(false);

  // Handle file selection or drag-and-drop
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      uploadFile(selectedFile);
    }
  };

  // Handle drag-and-drop
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
    if (droppedFile) {
      uploadFile(droppedFile); // Trigger upload
    }
  };

  // Prevent default behavior for drag-and-drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Upload file to backend
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8000/api/files", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setDownloadLink(response.data.file); // Set download link from response
      setShowSharingContainer(true); // Show email form after upload
      console.log("File uploaded, link:", response.data.file);
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };

  // Copy download link to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(downloadLink);
    alert("Link copied to clipboard!");
  };

  // Handle email form submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!downloadLink) return;
    const uuide = downloadLink.split('/').pop();
    try {
      await axios.post("http://localhost:8000/api/files/send", {
        uuid:uuide,
        emailfrom: emailData.fromEmail,
        emailto: emailData.toEmail,
        // fileLink: downloadLink,
      });
      alert("File sent via email!");
    } catch (err) {
      console.error(err);
    }
  };

  console.log("showSharingContainer:", showSharingContainer);

  return (
    <div className="upload-container">
      <form onSubmit={(e) => e.preventDefault()}>
        <div
          className={`drop-zone ${file ? "dragged" : ""}`}
          onClick={() => document.getElementById("fileInput").click()}
          onDrop={handleDrop}         // Handle drop event
          onDragOver={handleDragOver}  // Prevent default drag over behavior
        >
          <div className="icon-container">
            {/* Your icons here */}
          </div>
          <input
            type="file"
            id="fileInput"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <div className="title">
            Drop your Files here or, <span id="browseBtn">browse</span>
          </div>
        </div>
      </form>

      {/* Sharing container */}
      {showSharingContainer && (
        <div className="sharing-container">
          <p className="expire">Link expires in 24 hrs</p>
          <div className="input-container">
            <input type="text" value={downloadLink} readOnly id="fileURL" />
            <img
              src="./copy-icon.svg"
              id="copyURLBtn"
              alt="copy to clipboard icon"
              onClick={handleCopyToClipboard}
            />
          </div>

          {/* Email form */}
          <p className="email-info">Or Send via Email</p>
          <div className="email-container">
            <form id="emailForm" onSubmit={handleEmailSubmit}>
              <div className="filed">
                <label htmlFor="fromEmail">Your email</label>
                <input
                  type="email"
                  id="fromEmail"
                  required
                  value={emailData.fromEmail}
                  onChange={(e) => setEmailData({ ...emailData, fromEmail: e.target.value })}
                />
              </div>
              <div className="filed">
                <label htmlFor="toEmail">Receiver's email</label>
                <input
                  type="email"
                  id="toEmail"
                  required
                  value={emailData.toEmail}
                  onChange={(e) => setEmailData({ ...emailData, toEmail: e.target.value })}
                />
              </div>
              <div className="send-btn-container">
                <button type="submit">Send</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* <div className="image-vector"></div> */}
    </div>
  );
};

export default FileUpload;
