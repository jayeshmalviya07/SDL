# Backend Configuration for SDL

## Fix: FileCountLimitExceededException when registering Hub Admin

The error `FileCountLimitExceededException: attachment` occurs when the multipart request exceeds the backend's file/part count limit.

### Frontend change (already applied)

The frontend now sends **6 parts** instead of 17:
- `hubAdminData` – JSON blob with all text fields: name, dob, address, phone, email, username, password, hubName, hubAddress, city, state, country
- `profilePhoto`, `aadhar`, `policeVerification`, `agreement`, `panCard` – 5 files

### Backend change required

Update your `create-hubadmin` endpoint to accept the new format:

```java
import com.fasterxml.jackson.databind.ObjectMapper;

@PostMapping(value = "/create-hubadmin", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<?> createHubAdmin(
    @RequestPart("hubAdminData") String hubAdminJson,
    @RequestPart("profilePhoto") MultipartFile profilePhoto,
    @RequestPart("aadhar") MultipartFile aadhar,
    @RequestPart("policeVerification") MultipartFile policeVerification,
    @RequestPart("agreement") MultipartFile agreement,
    @RequestPart("panCard") MultipartFile panCard) throws Exception {

    ObjectMapper mapper = new ObjectMapper();
    Map<String, String> data = mapper.readValue(hubAdminJson, 
        new TypeReference<Map<String, String>>() {});

    String name = data.get("name");
    String dob = data.get("dob");
    String address = data.get("address");
    String phone = data.get("phone");
    String email = data.get("email");
    String username = data.get("username");
    String password = data.get("password");
    String hubName = data.get("hubName");
    String hubAddress = data.get("hubAddress");
    String city = data.get("city");
    String state = data.get("state");
    String country = data.get("country");

    // Pass these + the 5 MultipartFiles to your service layer
    // hubAdminService.create(name, dob, ..., profilePhoto, aadhar, ...);
}
```

Add `import com.fasterxml.jackson.core.type.TypeReference;`

---

## Alternative: Keep original format (if you prefer)

If you'd rather not change the controller, add the Tomcat config below to increase the part limit. Then revert the frontend to send individual fields (see frontend git history).

### Spring Boot fix

Add this to your `application.properties` or `application.yml`:

**application.properties:**
```properties
# Multipart limits
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=50MB
spring.servlet.multipart.enabled=true

# Tomcat: increase max part count (default may be low)
# For embedded Tomcat in Spring Boot, add a customizer:
```

**Java configuration** – create a config class in your backend:

```java
package com.yourapp.config;

import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TomcatConfig {

    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatCustomizer() {
        return factory -> factory.addConnectorCustomizers(connector -> {
            connector.setMaxParameterCount(10000);
            connector.setMaxPartCount(100);  // Allow up to 100 multipart parts (files + fields)
        });
    }
}
```

**Or** configure via `MultipartConfigElement` in your main application or a `@Bean`:

```java
@Bean
public MultipartConfigElement multipartConfigElement() {
    MultipartConfigFactory factory = new MultipartConfigFactory();
    factory.setMaxFileSize(DataSize.ofMegabytes(10));
    factory.setMaxRequestSize(DataSize.ofMegabytes(50));
    return factory.createMultipartConfig();
}
```

### Alternative: Tomcat `server.xml` (standalone Tomcat)

If using standalone Tomcat, add to your Connector in `conf/server.xml`:

```xml
<Connector port="8080" protocol="HTTP/1.1"
           maxParameterCount="10000"
           ... />
```

---

## Fix: 403 Forbidden on create-hubadmin

Ensure your Spring Security config allows SUPER_ADMIN to access `/api/superadmin/**`:

```java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers("/api/superadmin/**").hasRole("SUPER_ADMIN")
    // ...
);
```

And that your JWT includes the role claim (e.g. `role: "SUPER_ADMIN"` or `roles: ["ROLE_SUPER_ADMIN"]` depending on your backend).
