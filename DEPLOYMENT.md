# Deployment Guide - E-Commerce Platform

## Deployment Options

### Option 1: Heroku (Recommended for Beginners)

#### Backend Deployment

1. **Install Heroku CLI**

   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Heroku Account**
   - Go to https://www.heroku.com
   - Sign up for free

3. **Login to Heroku**

   ```bash
   heroku login
   ```

4. **Create Heroku App**

   ```bash
   cd backend
   heroku create your-ecommerce-backend
   ```

5. **Add MongoDB Atlas connection**

   ```bash
   heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
   heroku config:set JWT_SECRET=your-production-secret-key-change-this
   heroku config:set NODE_ENV=production
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

#### Frontend Deployment (Netlify)

1. **Create Netlify Account**
   - Go to https://app.netlify.com
   - Sign up with GitHub

2. **Update Frontend API URL**
   - Update `REACT_APP_API_URL` in frontend/.env:

   ```
   REACT_APP_API_URL=https://your-heroku-backend.herokuapp.com/api
   ```

3. **Connect GitHub Repository**
   - Link your GitHub repo to Netlify
   - Netlify will auto-deploy on every push

4. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `build`

### Option 2: AWS (Production Ready)

#### Backend on AWS EC2

1. **Launch EC2 Instance**
   - Choose Ubuntu 20.04 LTS
   - Configure security groups (allow ports 80, 443, 5000)

2. **SSH into Instance**

   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Install Dependencies**

   ```bash
   sudo apt update
   sudo apt install nodejs npm mongodb-org nginx
   ```

4. **Clone Repository**

   ```bash
   git clone https://github.com/yourusername/ecommerce.git
   cd ecommerce/backend
   npm install
   ```

5. **Configure Nginx Reverse Proxy**

   ```bash
   sudo nano /etc/nginx/sites-available/default
   ```

   Add:

   ```nginx
   location /api {
     proxy_pass http://localhost:5000;
     proxy_http_version 1.1;
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection 'upgrade';
   }
   ```

6. **Start Backend with PM2**
   ```bash
   sudo npm install -g pm2
   pm2 start src/server.js --name "ecommerce-backend"
   pm2 startup
   pm2 save
   ```

#### Frontend on AWS S3 + CloudFront

1. **Build Frontend**

   ```bash
   cd frontend
   npm run build
   ```

2. **Create S3 Bucket**

   ```bash
   aws s3 mb s3://your-ecommerce-frontend
   ```

3. **Upload Build Files**

   ```bash
   aws s3 sync build/ s3://your-ecommerce-frontend --delete
   ```

4. **Set up CloudFront Distribution**
   - Use CloudFront for CDN distribution
   - Point to S3 bucket
   - Use custom domain

### Option 3: Docker + Docker Compose (Recommended for Production)

1. **Create Dockerfile for Backend**

   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. **Create Dockerfile for Frontend**

   ```dockerfile
   FROM node:16-alpine AS build
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/build /usr/share/nginx/html
   EXPOSE 80
   ```

3. **Create docker-compose.yml**

   ```yaml
   version: "3.8"
   services:
     mongodb:
       image: mongo:5
       ports:
         - "27017:27017"
       volumes:
         - mongodb_data:/data/db
       environment:
         MONGO_INITDB_ROOT_USERNAME: root
         MONGO_INITDB_ROOT_PASSWORD: password

     backend:
       build: ./backend
       ports:
         - "5000:5000"
       depends_on:
         - mongodb
       environment:
         MONGODB_URI: mongodb://root:password@mongodb:27017/ecommerce
         JWT_SECRET: your-production-secret
         NODE_ENV: production

     frontend:
       build: ./frontend
       ports:
         - "80:80"
       depends_on:
         - backend

   volumes:
     mongodb_data:
   ```

4. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

## Environment Configuration Checklist

### Production Environment Variables

Backend (.env):

```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://[username]:[password]@[cluster].mongodb.net/ecommerce
JWT_SECRET=generate-a-strong-random-secret-key-here
JWT_EXPIRE=7d
```

Frontend (.env):

```
REACT_APP_API_URL=https://your-api-domain.com/api
```

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Enable HTTPS/SSL certificate
- [ ] Set secure CORS headers
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Use environment variables for secrets
- [ ] Remove console.log statements from production code
- [ ] Implement input validation and sanitization
- [ ] Set up regular database backups
- [ ] Enable MongoDB authentication
- [ ] Use strong database passwords
- [ ] Implement request logging
- [ ] Set up error monitoring (Sentry, LogRocket)
- [ ] Enable GZIP compression

## Performance Optimization

1. **Frontend**
   - Lazy load components
   - Optimize images
   - Use CDN for static assets
   - Enable gzip compression
   - Minify CSS/JS

2. **Backend**
   - Add database indexes
   - Implement caching (Redis)
   - Use database connection pooling
   - Optimize queries
   - Add API rate limiting

3. **Database**
   - Create indexes on frequently queried fields
   - Archive old data
   - Set up replication for backup
   - Regular backups

## Monitoring & Maintenance

1. **Set up Monitoring**
   - Use Datadog, New Relic, or similar
   - Monitor CPU, memory, disk usage
   - Track API response times
   - Monitor error rates

2. **Logging**
   - Implement centralized logging (ELK Stack, Splunk)
   - Log all API requests
   - Log errors and exceptions
   - Keep logs for 30 days minimum

3. **Backup Strategy**
   - Daily MongoDB backups
   - Store backups in multiple locations
   - Test recovery procedures
   - Document backup/restore process

## Scaling Tips

1. **Horizontal Scaling**
   - Load balance API servers
   - Use message queues (RabbitMQ, Redis)
   - Implement session management
   - Separate read/write databases

2. **Database Scaling**
   - Use MongoDB sharding
   - Implement read replicas
   - Cache frequently accessed data

3. **Caching Strategy**
   - Cache product listings
   - Cache user sessions
   - Cache search results
   - Use browser caching

## Post-Deployment

1. **Test All Features**
   - Register/Login flow
   - Product browsing and search
   - Add to cart and checkout
   - Admin panel operations

2. **User Testing**
   - Load testing with tools like Artillery
   - Browser compatibility testing
   - Mobile responsiveness testing
   - Performance testing

3. **Set up CI/CD Pipeline**
   - Automate testing
   - Automate deployment
   - Version control
   - Rollback procedures

## Troubleshooting Deployment Issues

**Issue: API calls return 404**

- Check API URL is correct
- Verify backend is running
- Check CORS configuration

**Issue: Database connection fails**

- Verify MongoDB connection string
- Check database credentials
- Ensure database is accessible from server
- Check firewall rules

**Issue: JWT authentication not working**

- Verify JWT_SECRET is same in backend
- Check token is being sent in requests
- Verify token hasn't expired

**Issue: Files not uploading**

- Check file size limits
- Verify storage permissions
- Check available disk space

## Success Metrics

After deployment, monitor:

- Response time < 300ms
- 99.9% uptime
- < 1% error rate
- Server CPU < 70%
- Server memory < 80%
- Database connection pool healthy

## Support Resources

- Heroku Docs: https://devcenter.heroku.com/
- AWS Docs: https://docs.aws.amazon.com/
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Docker Docs: https://docs.docker.com/
