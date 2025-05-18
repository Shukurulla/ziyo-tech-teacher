import React from "react";
import { Box, LinearProgress, Typography } from "@mui/material";

const FileUploadProgress = ({ progress, fileName }) => {
  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {fileName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {Math.round(progress)}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 5,
          backgroundColor: "#e6e6e6",
          "& .MuiLinearProgress-bar": {
            borderRadius: 5,
            backgroundColor: "#1a90ff",
          },
        }}
      />
    </Box>
  );
};

export default FileUploadProgress;
