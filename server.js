const express = require('express');
const sequelize = require('./Config/dbConnect');

const cors = require('cors');
require('dotenv').config();
const app = express();
const UsersRoutes = require('./Routes/UsersRoutes')
const LogoRoutes = require('./Routes/LogoRoutes')
const HeaderRoutes = require('./Routes/HeaderRoutes')
const HeroesRoutes = require('./Routes/HeroRoutes')
const ServicesRoutes = require('./Routes/ServicesRoutes')
const FooterRoutes = require('./Routes/FooterRoutes')
const FooterIconRoutes = require('./Routes/FooterIconsRoutes')
const HeroChaletsRoutes = require('./Routes/ChaletsHeroRoutes')
const ChaletsRoutes = require('./Routes/ChaletsRoutes')
const statusChaletRoutes = require('./Routes/StatusChaletsRoutes')
const ChaletImagesRoutes = require('./Routes/ChaletsImagesRoutes')
const BreifDetailsChaletsRoutes = require('./Routes/BreifDetailsChaletsRoutes')
const ReservatioDatesRoutes = require('./Routes/ReservationsDateRoutes')
const ContactUsRoutes = require('./Routes/ContactUsRoutes')
const RightTimeRoutes = require('./Routes/RightTimeRoutes')
const StatusRoutes = require('./Routes/StatusChaletsRoutes')
const ChaletsDetailsRoutes = require('./Routes/ChaletsDetailsRoutes')
const HeroEventsRoutes = require('./Routes/EventsHeroRoutes')
const EventsTypesRoutes = require('./Routes/TypesEventsRoutes')






app.use(cors());
app.use(express.json());
app.use('/users',UsersRoutes)
app.use('/logos',LogoRoutes)
app.use('/header',HeaderRoutes)
app.use('/heroes',HeroesRoutes)
app.use('/services',ServicesRoutes)
app.use('/footer',FooterRoutes)
app.use('/footericons',FooterIconRoutes)
app.use('/heroChalets',HeroChaletsRoutes)
app.use('/chalets',ChaletsRoutes)
app.use('/statuschalets',statusChaletRoutes)
app.use('/chaletsimages',ChaletImagesRoutes)
app.use('/BreifDetailsChalets',BreifDetailsChaletsRoutes)
app.use('/ReservationDates',ReservatioDatesRoutes)
app.use('/ContactUs',ContactUsRoutes)
app.use('/RightTimes',RightTimeRoutes)
app.use('/status',StatusRoutes)
app.use('/chaletsdetails',ChaletsDetailsRoutes)
app.use('/heroevents',HeroEventsRoutes)
app.use('/events',EventsTypesRoutes)



sequelize.sync({ force: false }).then(() => {
    console.log('Database connected and synced!');
  });
  
  
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
  });
  