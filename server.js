const express = require('express');
const sequelize = require('./Config/dbConnect');
const { handleError } = require('./MiddleWares/errorHandler');
const helmet = require('helmet');


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
const StatusRoutes = require('./Routes/StatusRoutes')
const ChaletsDetailsRoutes = require('./Routes/ChaletsDetailsRoutes')
const HeroEventsRoutes = require('./Routes/EventsHeroRoutes')
const EventsTypesRoutes = require('./Routes/TypesEventsRoutes')
const SubEventsRoutes = require('./Routes/SubEventsRoutes')
const AvailableEventsRoutes = require('./Routes/AvailableEventsRoutes')
const AvailableImages = require('./Routes/AvailableImagesRoutes')
const PlansRoutes = require('./Routes/PlansRoutes')
const ReservatioEventsRoutes = require('./Routes/ReservationsEventsRoutes')
const CategoryLandsRoutes = require('./Routes/CategoriesLandsRoutes')
const PrpertyLandsRoutes = require('./Routes/PropertiesLandsRoutes')
const ImagesLandsRoutes = require('./Routes/CategoriesImagesRoutes')
const BreifLandsRoutes = require('./Routes/BriefLandsRoutes')
const ReservationeLandsRoutes = require('./Routes/ReservationsLandsRoutes')
const ReservationsRoutes = require('./Routes/ReservationsRoutes')
const UsersTypesRoutes = require('./Routes/UsersTypesRoutes')
const ReservationsChaletsRoutes = require('./Routes/ReservationsChaletsRoutes')
const WalletRoutes = require('./Routes/WalletRoutes')
const PropsChaletsRoutes = require('./Routes/ChaletsPropsRoutes')



app.use(handleError)
app.use(helmet());
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
app.use('/subevents',SubEventsRoutes)
app.use('/availablevents',AvailableEventsRoutes)
app.use('/availableimages',AvailableImages)
app.use('/plans',PlansRoutes)
app.use('/reservationsEvents',ReservatioEventsRoutes)
app.use('/categorieslands',CategoryLandsRoutes)
app.use('/propertyLands',PrpertyLandsRoutes)
app.use('/imageslands',ImagesLandsRoutes)
app.use('/BreifLands',BreifLandsRoutes)
app.use('/reservationLands',ReservationeLandsRoutes)
app.use('/reservations',ReservationsRoutes)
app.use('/userstypes',UsersTypesRoutes)
app.use('/ReservationsChalets',ReservationsChaletsRoutes)
app.use('/Wallet',WalletRoutes)
app.use('/propschalets',PropsChaletsRoutes)






sequelize.sync({ force: false }).then(() => {
    console.log('Database connected and synced!');
  });
  
  app.get("/", (req, res) => {
    res.send("Welcome to Rowqan! ");
  });
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
  });
  