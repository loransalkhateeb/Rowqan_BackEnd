const express = require('express');
const sequelize = require('./Config/dbConnect');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();
const compression = require('compression');
app.use(compression());

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

const server = http.createServer(app);
const io = socketIo(server);


app.use((req, res, next) => {
  req.socketIoInstance = io;  
  next();
});

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(express.json());


io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("send_message", (message) => {
    console.log("Message received: ", message);
    io.emit("receive_message", message);
  });
  
  socket.on('receive_message', (data) => {
    console.log("Message received:", data);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});



const UsersRoutes = require('./Routes/UsersRoutes');
const LogoRoutes = require('./Routes/LogoRoutes');
const HeaderRoutes = require('./Routes/HeaderRoutes');
const HeroesRoutes = require('./Routes/HeroRoutes');
const ServicesRoutes = require('./Routes/ServicesRoutes');
const FooterRoutes = require('./Routes/FooterRoutes');
const FooterIconRoutes = require('./Routes/FooterIconsRoutes');
const HeroChaletsRoutes = require('./Routes/ChaletsHeroRoutes');
const ChaletsRoutes = require('./Routes/ChaletsRoutes');
const statusChaletRoutes = require('./Routes/StatusChaletsRoutes');
const ChaletImagesRoutes = require('./Routes/ChaletsImagesRoutes');
const BreifDetailsChaletsRoutes = require('./Routes/BreifDetailsChaletsRoutes');
const ReservatioDatesRoutes = require('./Routes/ReservationsDateRoutes');
const ContactUsRoutes = require('./Routes/ContactUsRoutes');
const RightTimeRoutes = require('./Routes/RightTimeRoutes');
const StatusRoutes = require('./Routes/StatusRoutes');
const ChaletsDetailsRoutes = require('./Routes/ChaletsDetailsRoutes');
const HeroEventsRoutes = require('./Routes/EventsHeroRoutes');
const EventsTypesRoutes = require('./Routes/TypesEventsRoutes');
const SubEventsRoutes = require('./Routes/SubEventsRoutes');
const AvailableEventsRoutes = require('./Routes/AvailableEventsRoutes');
const AvailableImages = require('./Routes/AvailableImagesRoutes');
const PlansRoutes = require('./Routes/PlansRoutes');
const ReservatioEventsRoutes = require('./Routes/ReservationsEventsRoutes');
const CategoryLandsRoutes = require('./Routes/CategoriesLandsRoutes');
const PrpertyLandsRoutes = require('./Routes/PropertiesLandsRoutes');
const ImagesLandsRoutes = require('./Routes/CategoriesImagesRoutes');
const BreifLandsRoutes = require('./Routes/BriefLandsRoutes');
const ReservationeLandsRoutes = require('./Routes/ReservationsLandsRoutes');
const ReservationsRoutes = require('./Routes/ReservationsRoutes');
const UsersTypesRoutes = require('./Routes/UsersTypesRoutes');
const ReservationsChaletsRoutes = require('./Routes/ReservationsChaletsRoutes');
const WalletRoutes = require('./Routes/WalletRoutes');
const PropsChaletsRoutes = require('./Routes/ChaletsPropsRoutes');
const FeedBackRoutes = require('./Routes/FeedBacksRoutes');
const MessagesRoutes = require('./Routes/MessagesRoutes');
const HeroLands = require('./Routes/HeroLandsRoutes');
const PaymentsRoutes = require('./Routes/PaymentsRoutes')
const AboutRoutes = require('./Routes/AboutUsRoutes')
const BlogRoutes = require('./Routes/BlogRoutes')




const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  'https://rowqan.com',
  'https://rowqanbackend.rowqan.com',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use('/users', UsersRoutes);
app.use('/logos', LogoRoutes);
app.use('/header', HeaderRoutes);
app.use('/heroes', HeroesRoutes);
app.use('/services', ServicesRoutes);
app.use('/footer', FooterRoutes);
app.use('/footericons', FooterIconRoutes);
app.use('/heroChalets', HeroChaletsRoutes);
app.use('/chalets', ChaletsRoutes);
app.use('/statuschalets', statusChaletRoutes);
app.use('/chaletsimages', ChaletImagesRoutes);
app.use('/BreifDetailsChalets', BreifDetailsChaletsRoutes);
app.use('/ReservationDates', ReservatioDatesRoutes);
app.use('/ContactUs', ContactUsRoutes);
app.use('/RightTimes', RightTimeRoutes);
app.use('/status', StatusRoutes);
app.use('/chaletsdetails', ChaletsDetailsRoutes);
app.use('/heroevents', HeroEventsRoutes);
app.use('/events', EventsTypesRoutes);
app.use('/subevents', SubEventsRoutes);
app.use('/availablevents', AvailableEventsRoutes);
app.use('/availableimages', AvailableImages);
app.use('/plans', PlansRoutes);
app.use('/reservationsEvents', ReservatioEventsRoutes);
app.use('/categorieslands', CategoryLandsRoutes);
app.use('/propertyLands', PrpertyLandsRoutes);
app.use('/imageslands', ImagesLandsRoutes);
app.use('/BreifLands', BreifLandsRoutes);
app.use('/reservationLands', ReservationeLandsRoutes);
app.use('/reservations', ReservationsRoutes);
app.use('/userstypes', UsersTypesRoutes);
app.use('/ReservationsChalets', ReservationsChaletsRoutes);
app.use('/Wallet', WalletRoutes);
app.use('/propschalets', PropsChaletsRoutes);
app.use('/FeedBacks', FeedBackRoutes);
app.use('/messages', MessagesRoutes);
app.use('/heroLands', HeroLands);
app.use('/payments', PaymentsRoutes); 
app.use('/aboutUs',AboutRoutes)
app.use('/Blogs',BlogRoutes)






const IP_LOOKUP_API = "https://ipqualityscore.com/api/json/ip/T0hMeOnMzeAnPVsmgH6AKMhguvmr1Yv9";

async function checkVPN(userIP) {
  try {
    const response = await axios.get(`${IP_LOOKUP_API}?ip=${userIP}`);
    const { vpn, proxy, fraud_score, isp, city, asn, is_proxy } = response.data;

    if (vpn || proxy || is_proxy) {
      console.log("VPN or Proxy detected.");
      return false;
    }

    if (fraud_score > 50) {  
      console.log("Fraud score is too high.");
      return false;
    }

    if (isp && isp.toLowerCase().includes("vpn") || city === "unknown") {
      console.log("Suspicious ISP or City.");
      return false;
    }

    if (asn && (asn === "12345" || asn === "67890")) {  
      console.log("Suspicious ASN detected.");
      return false;
    }

    const geo = geoip.lookup(userIP);
    if (!geo || geo.country !== "JO") {
      console.log("Access denied due to non-Jordan IP.");
      return false;
    }

    return true; 

  } catch (error) {
    console.error("Error checking VPN:", error);
    return false; 
  }
}

function checkAuth(req, res, next) {
  const token = req.cookies.authToken || req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = decoded;
    next(); 
  });
}

app.use('/dashboard', async (req, res, next) => {
  const userIP = req.query.ip || requestIp.getClientIp(req);  

  const isAllowed = await checkVPN(userIP); 

  if (!isAllowed) {
    return res.status(403).json({ message: "Access denied due to VPN/Proxy or non-Jordan IP" });
  }

  res.status(200).json({ message: "Access granted to the dashboard" });
});

sequelize.sync({ force: false }).then(() => {
  console.log('Database connected and synced!');
});

app.get("/", (req, res) => {
  res.send("Welcome to Rowqan!");
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
