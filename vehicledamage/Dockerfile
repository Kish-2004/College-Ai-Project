# Use the official Java 17 image
FROM eclipse-temurin:17-jdk-jammy

# Set a generic argument for the JAR file
ARG JAR_FILE=target/*.jar

# Copy the built JAR file into the container
COPY ${JAR_FILE} app.jar

# Expose the port your app runs on
EXPOSE 8080

# The command to run your application
ENTRYPOINT ["java", "-jar", "/app.jar"]