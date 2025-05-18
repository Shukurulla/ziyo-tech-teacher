import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { FiChevronLeft } from "react-icons/fi";
import axios from "../services/api";

const TestTypeSelection = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [regularTest, setRegularTest] = useState(null);
  const [matchingTest, setMatchingTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        // Fetch regular tests
        const regularRes = await axios.get(`/api/tests/${videoId}`);
        if (regularRes.data.data) setRegularTest(regularRes.data.data);

        // Fetch matching tests
        try {
          const matchingRes = await axios.get(
            `/api/questions/video/${videoId}`
          );
          if (matchingRes.data && matchingRes.data.length > 0) {
            setMatchingTest(matchingRes.data[0]); // Take the first one if multiple
          }
        } catch (err) {
          console.log("No matching tests found for this video");
        }
      } catch (err) {
        console.error("Error fetching tests:", err);
        setError("Testlarni yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [videoId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button onClick={() => navigate(-1)}>
          <FiChevronLeft size={25} />
        </Button>
        <Typography variant="h5" className="text-center mt-10 text-red-500">
          {error}
        </Typography>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button onClick={() => navigate(-1)} className="mb-4">
        <FiChevronLeft size={25} />
      </Button>

      <Typography variant="h4" className="font-bold mb-6 text-center">
        Test turini tanlang
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Regular Test Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <Typography variant="h5" className="font-bold mb-4">
              A/B/C/D Test
            </Typography>
            <Typography className="mb-6 text-gray-600">
              Bir nechta variant ichidan to'g'risini tanlash testini yarating.
              Har bir savol uchun 4 ta javob varianti.
            </Typography>
            <Box className="flex justify-center">
              <Button
                variant="contained"
                color={regularTest ? "secondary" : "primary"}
                onClick={() => navigate(`/video/${videoId}/add-test`)}
                fullWidth
              >
                {regularTest ? "Tahrirlash" : "Yaratish"}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Matching Test Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <Typography variant="h5" className="font-bold mb-4">
              Matching Test
            </Typography>
            <Typography className="mb-6 text-gray-600">
              Juftliklar tuzish testini yarating. O'quvchilar ikki tomondan
              to'g'ri juftliklarni tanlab javob berishadi.
            </Typography>
            <Box className="flex justify-center">
              <Button
                variant="contained"
                color={matchingTest ? "secondary" : "primary"}
                onClick={() => navigate(`/video/${videoId}/add-matching-test`)}
                fullWidth
              >
                {matchingTest ? "Tahrirlash" : "Yaratish"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestTypeSelection;
