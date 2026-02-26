package com.Shridigambara.wms.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        System.out.println("---- JWT FILTER CALLED ----");
        System.out.println("Request URI: " + request.getRequestURI());

        String authHeader = request.getHeader("Authorization");
        System.out.println("Authorization Header: " + authHeader);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            System.out.println("Token extracted: " + token);

            boolean isValid = jwtUtil.validateToken(token);
            System.out.println("Token valid: " + isValid);

            if (isValid) {
                String subject = jwtUtil.getSubject(token);
                String role = jwtUtil.getRole(token);
                Long entityId = jwtUtil.getEntityId(token);

                System.out.println("Subject: " + subject);
                System.out.println("Role from token: " + role);

                String authority = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                System.out.println("Final Authority: " + authority);

                UserPrincipal principal = new UserPrincipal(subject, role, entityId);

                var auth = new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority(authority))
                );

                SecurityContextHolder.getContext().setAuthentication(auth);

                System.out.println("Authentication set: " +
                        SecurityContextHolder.getContext().getAuthentication());
            }
        } else {
            System.out.println("No Bearer token found.");
        }

        filterChain.doFilter(request, response);
    }
}
