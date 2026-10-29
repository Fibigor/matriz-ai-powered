FROM node:22-alpine AS frontend
WORKDIR /workspace/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM maven:3.9-eclipse-temurin-21 AS backend
WORKDIR /workspace/backend
COPY backend/pom.xml ./
RUN mvn -q dependency:go-offline
COPY backend/src ./src
COPY --from=frontend /workspace/frontend/dist ./src/main/resources/static
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S matriz && adduser -S matriz -G matriz
WORKDIR /app
COPY --from=backend /workspace/backend/target/matriz-0.3.0.jar app.jar
USER matriz
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
