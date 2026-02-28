package com.Shridigambara.wms.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @org.springframework.beans.factory.annotation.Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(
            org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry registry) {
        String path = uploadDir.replace("\\", "/");
        if (!path.endsWith("/"))
            path += "/";

        String location;
        if (path.contains(":/")) {
            // Windows absolute path
            location = "file:///" + path;
        } else if (path.startsWith("/")) {
            // Unix absolute path
            location = "file:" + path;
        } else {
            // Relative path
            location = "file:./" + path;
        }

        System.out.println("DEBUG: Registering resource handler for /api/uploads/** at " + location);
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations(location);
    }
}
