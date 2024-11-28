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



sequelize.sync({ force: false }).then(() => {
    console.log('Database connected and synced!');
  });
  
  
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
  });
  