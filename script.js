function resizePhoto() {
    const fileInput = document.getElementById("photoInput");
    const canvas = document.getElementById("canvas");
    const downloadLink = document.getElementById("downloadLink");
  
    if (!fileInput.files.length) {
      alert("Please select a photo first.");
      hideLoader();
      return;
    }
  
    const file = fileInput.files[0];
    const img = new Image();
  
    img.onload = function () {
      const ctx = canvas.getContext("2d");
  
      // JKSSB standard size (example)
      const width = 200;
      const height = 230;
  
      canvas.width = width;
      canvas.height = height;
  
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
  
      canvas.toBlob(
        function (blob) {
          const url = URL.createObjectURL(blob);
          downloadLink.href = url;
          downloadLink.style.display = "block";
          downloadLink.innerText = "Download JKSSB Ready Photo";
        },
        "image/jpeg",
        0.7 // compression quality (adjustable)
      );
    };
  
    img.src = URL.createObjectURL(file);
  }

  function resizeSignature() {
    const fileInput = document.getElementById("signInput");
    const canvas = document.getElementById("signCanvas");
    const downloadLink = document.getElementById("signDownload");
  
    if (!fileInput.files.length) {
      alert("Please select a signature image first.");
      hideLoader();
      return;
    }
  
    const file = fileInput.files[0];
    const img = new Image();
  
    img.onload = function () {
      const ctx = canvas.getContext("2d");
  
      // JKSSB signature size (safe standard)
      const width = 300;
      const height = 80;
  
      canvas.width = width;
      canvas.height = height;
  
      // White background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
  
      ctx.drawImage(img, 0, 0, width, height);
  
      canvas.toBlob(
        function (blob) {
          const url = URL.createObjectURL(blob);
          downloadLink.href = url;
          downloadLink.style.display = "block";
          downloadLink.innerText = "Download JKSSB Ready Signature";
        },
        "image/jpeg",
        0.8 // compression quality
      );
    };
  
    img.src = URL.createObjectURL(file);
  }

  async function convertToPDF() {
    const input = document.getElementById("pdfImages");
    const downloadLink = document.getElementById("pdfDownload");
  
    if (!input.files.length) {
      alert("Please select at least one image.");
      hideLoader();
      return;
    }
  
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
  
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      const imgData = await readImage(file);
  
      const img = new Image();
      img.src = imgData;
  
      await new Promise(resolve => {
        img.onload = () => {
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
  
          const ratio = Math.min(
            pageWidth / img.width,
            pageHeight / img.height
          );
  
          const imgWidth = img.width * ratio;
          const imgHeight = img.height * ratio;
  
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2;
  
          if (i !== 0) pdf.addPage();
          pdf.addImage(img, "JPEG", x, y, imgWidth, imgHeight);
  
          resolve();
        };
      });
    }
  
    const pdfBlob = pdf.output("blob");
    const url = URL.createObjectURL(pdfBlob);
  
    downloadLink.href = url;
    downloadLink.style.display = "block";
    downloadLink.innerText = "Download JKSSB Ready PDF";
  }
  
  function readImage(file) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  async function compressPDF() {
    const fileInput = document.getElementById("pdfInput");
    const quality = parseFloat(document.getElementById("pdfQuality").value);
    const downloadLink = document.getElementById("pdfCompressedDownload");
  
    if (!fileInput.files.length) {
      alert("Please select a PDF file first.");
      hideLoader();
      return;
    }
  
    const file = fileInput.files[0];
    const arrayBuffer = await file.arrayBuffer();
  
    // Load PDF using PDF.js
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
  
    const { jsPDF } = window.jspdf;
    const newPdf = new jsPDF("p", "mm", "a4");
  
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
  
      // Render page to canvas
      const viewport = page.getViewport({ scale: 1.5 }); // controls DPI
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
  
      canvas.width = viewport.width;
      canvas.height = viewport.height;
  
      await page.render({ canvasContext: ctx, viewport }).promise;
  
      // Convert canvas to JPEG (compression happens here)
      const imgData = canvas.toDataURL("image/jpeg", quality);
  
      const pageWidth = newPdf.internal.pageSize.getWidth();
      const pageHeight = newPdf.internal.pageSize.getHeight();
  
      if (pageNum !== 1) newPdf.addPage();
      newPdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);
    }
  
    const compressedBlob = newPdf.output("blob");
    const url = URL.createObjectURL(compressedBlob);
  
    downloadLink.href = url;
    downloadLink.style.display = "block";
    downloadLink.innerText = "Download JKSSB Compressed PDF";
  }
  btn.disabled = true;
btn.innerText = "Processing...";
showLoader();
  async function makeExactPDF(btn) 
  
  {
    showLoader();
    const input = document.getElementById("pdfExactInput");
    const info = document.getElementById("pdfSizeInfo");
    const downloadLink = document.getElementById("pdfExactDownload");
  
    if (!input.files.length) {
      alert("Please select a PDF file.");
      hideLoader();
      return;
    }
  
    const file = input.files[0];
    const buffer = await file.arrayBuffer();
  
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    const pdfDoc = await loadingTask.promise;
  
    let quality = 0.6;          // start quality
    let scale = 1.4;            // render scale
    let finalBlob = null;
  
    const { jsPDF } = window.jspdf;
  
    for (let attempt = 0; attempt < 10; attempt++) {
      const newPdf = new jsPDF("p", "mm", "a4");
  
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
  
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
  
        await page.render({ canvasContext: ctx, viewport }).promise;
  
        const imgData = canvas.toDataURL("image/jpeg", quality);
        const w = newPdf.internal.pageSize.getWidth();
        const h = newPdf.internal.pageSize.getHeight();
  
        if (pageNum !== 1) newPdf.addPage();
        newPdf.addImage(imgData, "JPEG", 0, 0, w, h);
      }
  
      const blob = newPdf.output("blob");
      const sizeKB = blob.size / 1024;
  
      info.className = ""; // reset

if (sizeKB > 100) {
  info.classList.add("size-bad");
  info.innerText = `Too Large: ${sizeKB.toFixed(1)} KB (Target: ≤ 100 KB)`;
} else if (sizeKB < 20) {
  info.classList.add("size-warn");
  info.innerText = `Too Small: ${sizeKB.toFixed(1)} KB (Target: ≥ 20 KB)`;
} else {
  info.classList.add("size-ok");
  info.innerText = `JKSSB Ready ✔ Size: ${sizeKB.toFixed(1)} KB`;
}
  
      if (sizeKB >= 20 && sizeKB <= 100) {
        finalBlob = blob;
        break;
      }
  
      // adjust compression
      if (sizeKB > 100) {
        quality -= 0.08;
        scale -= 0.1;
      } else {
        quality += 0.05;
        scale += 0.1;
      }
  
      quality = Math.max(0.2, Math.min(0.9, quality));
      scale = Math.max(1.0, Math.min(2.0, scale));
    }
  
    if (!finalBlob) {
      alert("Could not reach exact size range. Try another PDF.");
      hideLoader();
      return;
    }
  
    const url = URL.createObjectURL(finalBlob);
    downloadLink.href = url;
    downloadLink.style.display = "block";
    info.innerText += " ✅ JKSSB Ready";
  }


  async function lockPdfTo50() {
    const input = document.getElementById("pdfLockInput");
    const info = document.getElementById("pdfLockInfo");
    const downloadLink = document.getElementById("pdfLockDownload");
  
    if (!input.files.length) {
      alert("Please select a PDF file.");
      hideLoader();
      return;
    }
  
    const TARGET_KB = 50;
    const TOLERANCE_KB = 1; // ±1 KB
  
    const buffer = await input.files[0].arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    const pdfDoc = await loadingTask.promise;
  
    let quality = 0.6;
    let scale = 1.4;
    let finalBlob = null;
  
    const { jsPDF } = window.jspdf;
  
    for (let attempt = 0; attempt < 12; attempt++) {
      const newPdf = new jsPDF("p", "mm", "a4");
  
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
  
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
  
        await page.render({ canvasContext: ctx, viewport }).promise;
  
        const imgData = canvas.toDataURL("image/jpeg", quality);
        const w = newPdf.internal.pageSize.getWidth();
        const h = newPdf.internal.pageSize.getHeight();
  
        if (pageNum !== 1) newPdf.addPage();
        newPdf.addImage(imgData, "JPEG", 0, 0, w, h);
      }
  
      const blob = newPdf.output("blob");
      const sizeKB = blob.size / 1024;
  
      // Status text
      info.className = "";
      info.innerText = `Trying… ${sizeKB.toFixed(1)} KB (Target: 50 KB)`;
  
      // Check lock
      if (Math.abs(sizeKB - TARGET_KB) <= TOLERANCE_KB) {
        finalBlob = blob;
        info.classList.add("size-ok");
        info.innerText = `Locked ✔ ${sizeKB.toFixed(1)} KB`;
        break;
      }
  
      // Adjust parameters
      if (sizeKB > TARGET_KB) {
        quality -= 0.06;
        scale -= 0.08;
      } else {
        quality += 0.04;
        scale += 0.08;
      }
  
      quality = Math.max(0.2, Math.min(0.9, quality));
      scale = Math.max(1.0, Math.min(2.0, scale));
    }
  
    if (!finalBlob) {
      info.classList.add("size-bad");
      info.innerText = "Could not lock to 50 KB. Try fewer pages or clearer text.";
      hideLoader();
      return;
    }
  
    const url = URL.createObjectURL(finalBlob);
    downloadLink.href = url;
    downloadLink.style.display = "block";
  }


  async function showPdfPreview(blob) {
    const preview = document.getElementById("pdfPreview");
    preview.innerHTML = "";
    preview.style.display = "flex";
  
    const buffer = await blob.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 0.3 });
  
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
  
      await page.render({ canvasContext: ctx, viewport }).promise;
  
      const wrapper = document.createElement("div");
      wrapper.className = "pdf-page";
      wrapper.appendChild(canvas);
  
      preview.appendChild(wrapper);
    }
  }

