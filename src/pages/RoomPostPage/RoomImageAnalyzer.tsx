// import React, { useRef, useState, useEffect } from "react";
// import * as cocoSsd from "@tensorflow-models/coco-ssd";
// import "@tensorflow/tfjs";

// type ImageFeedback = {
//   url: string;
//   feedback: string;
//   objectFlags: Record<string, boolean>;
// };

// const RoomImageAnalyzer: React.FC = () => {
//   const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
//   const [imageFeedbacks, setImageFeedbacks] = useState<ImageFeedback[]>([]);
//   const [missingSuggestions, setMissingSuggestions] = useState<string>("");

//   useEffect(() => {
//     cocoSsd.load().then(setModel);
//   }, []);

//   const analyzeImage = (file: File, url: string): Promise<ImageFeedback> => {
//     return new Promise((resolve) => {
//       const img = new Image();
//       img.src = url;

//       img.onload = async () => {
//         const canvas = document.createElement("canvas");
//         const ctx = canvas.getContext("2d")!;
//         canvas.width = img.width;
//         canvas.height = img.height;
//         ctx.drawImage(img, 0, 0);

//         const predictions = await model!.detect(img);
//         const classes = predictions.map((p) => p.class);

//         const objectFlags: Record<string, boolean> = {
//           bed: false,
//           chair: false,
//           table: false,
//           tv: false,
//           refrigerator: false,
//           window: false,
//           sink: false,
//           toilet: false,
//           microwave: false,
//           laptop: false,
//         };

//         classes.forEach((cls) => {
//           if (objectFlags.hasOwnProperty(cls)) objectFlags[cls] = true;
//         });

//         const detected: string[] = [];
//         if (objectFlags.bed) detected.push("🛏️ Giường");
//         if (objectFlags.table || objectFlags.chair) detected.push("🪑 Bàn/Ghế");
//         if (objectFlags.tv) detected.push("📺 TV");
//         if (objectFlags.refrigerator) detected.push("🧊 Tủ lạnh");
//         if (objectFlags.window) detected.push("🪟 Cửa sổ");
//         if (objectFlags.sink || objectFlags.toilet) detected.push("🚽 Nhà vệ sinh");
//         if (objectFlags.microwave) detected.push("🍳 Bếp điện");
//         if (objectFlags.laptop) detected.push("💻 Bàn làm việc");

//         const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//         const pixels = imageData.data;
//         let totalBrightness = 0;
//         for (let i = 0; i < pixels.length; i += 4) {
//           totalBrightness += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
//         }
//         const avgBrightness = totalBrightness / (pixels.length / 4);

//         let feedback = `✅ Vật thể phát hiện: ${detected.join(", ") || "Không rõ vật thể chính"}.\n`;
//         feedback += avgBrightness < 100
//           ? "⚠️ Ảnh hơi tối. Nên chụp lại với ánh sáng tốt hơn.\n"
//           : "💡 Ảnh đủ sáng.\n";

//         resolve({ url, feedback, objectFlags });
//       };
//     });
//   };

//   const handleMultiImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
//     if (!files.length || !model) return;

//     const newFeedbacks: ImageFeedback[] = [];
//     const allDetectedFlags: Record<string, boolean> = {
//       bed: false,
//       chair: false,
//       table: false,
//       tv: false,
//       refrigerator: false,
//       window: false,
//       sink: false,
//       toilet: false,
//       microwave: false,
//       laptop: false,
//     };

//     for (const file of files) {
//       const url = URL.createObjectURL(file);
//       const result = await analyzeImage(file, url);
//       newFeedbacks.push(result);

//       // Cập nhật cờ tổng hợp
//       Object.keys(result.objectFlags).forEach((key) => {
//         allDetectedFlags[key] ||= result.objectFlags[key];
//       });
//     }

//     setImageFeedbacks((prev) => [...prev, ...newFeedbacks]);

//     const missing: string[] = [];
//     if (!allDetectedFlags.window) missing.push("🪟 Cửa sổ");
//     if (!allDetectedFlags.bed) missing.push("🛏️ Giường");
//     if (!allDetectedFlags.tv && !allDetectedFlags.refrigerator) missing.push("📺 TV hoặc 🧊 Tủ lạnh");
//     if (!allDetectedFlags.sink && !allDetectedFlags.toilet) missing.push("🚽 Hình ảnh nhà vệ sinh");

//     if (missing.length > 0) {
//       setMissingSuggestions(`📌 Gợi ý bổ sung: Nên có ${missing.join(", ")}.`);
//     } else {
//       setMissingSuggestions("👍 Bộ ảnh đã khá đầy đủ cho việc đăng trọ.");
//     }
//   };

//   const handleRemoveImage = (urlToRemove: string) => {
//     const filtered = imageFeedbacks.filter((item) => item.url !== urlToRemove);
//     setImageFeedbacks(filtered);

//     // Cập nhật lại gợi ý nếu còn ảnh
//     if (filtered.length > 0) {
//       const combinedFlags: Record<string, boolean> = {
//         bed: false,
//         chair: false,
//         table: false,
//         tv: false,
//         refrigerator: false,
//         window: false,
//         sink: false,
//         toilet: false,
//         microwave: false,
//         laptop: false,
//       };
//       filtered.forEach((item) => {
//         Object.keys(item.objectFlags).forEach((key) => {
//           combinedFlags[key] ||= item.objectFlags[key];
//         });
//       });

//       const missing: string[] = [];
//       if (!combinedFlags.window) missing.push("🪟 Cửa sổ");
//       if (!combinedFlags.bed) missing.push("🛏️ Giường");
//       if (!combinedFlags.tv && !combinedFlags.refrigerator) missing.push("📺 TV hoặc 🧊 Tủ lạnh");
//       if (!combinedFlags.sink && !combinedFlags.toilet) missing.push("🚽 Hình ảnh nhà vệ sinh");

//       if (missing.length > 0) {
//         setMissingSuggestions(`📌 Gợi ý bổ sung: Nên có ${missing.join(", ")}.`);
//       } else {
//         setMissingSuggestions("👍 Bộ ảnh đã khá đầy đủ cho việc đăng trọ.");
//       }
//     } else {
//       setMissingSuggestions("");
//     }
//   };

//   return (
//     <div>
//       <h3>📷 Phân tích ảnh đăng trọ bằng AI</h3>
//       <input type="file" accept="image/*" multiple onChange={handleMultiImageChange} />
//       <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 20 }}>
//         {imageFeedbacks.map((item) => (
//           <div key={item.url} style={{ border: "1px solid #ccc", padding: 10, borderRadius: 10, position: "relative", width: 300 }}>
//             <button
//               onClick={() => handleRemoveImage(item.url)}
//               style={{
//                 position: "absolute",
//                 top: 5,
//                 right: 5,
//                 background: "red",
//                 color: "white",
//                 border: "none",
//                 borderRadius: "50%",
//                 width: 25,
//                 height: 25,
//                 cursor: "pointer",
//               }}
//             >
//               ×
//             </button>
//             <img src={item.url} alt="preview" style={{ width: "100%", borderRadius: 6 }} />
//             <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem", marginTop: 10 }}>{item.feedback}</pre>
//           </div>
//         ))}
//       </div>
//       {imageFeedbacks.length > 0 && (
//         <div style={{ marginTop: 20, background: "#f0f0f0", padding: 10, borderRadius: 6 }}>
//           <strong>{missingSuggestions}</strong>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RoomImageAnalyzer;

import React from 'react'

export default function RoomImageAnalyzer() {
  return (
    <div>RoomImageAnalyzer</div>
  )
}

