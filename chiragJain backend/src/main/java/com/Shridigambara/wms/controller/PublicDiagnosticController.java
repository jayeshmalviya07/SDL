package com.Shridigambara.wms.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicDiagnosticController {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @GetMapping("/debug/paths")
    public ResponseEntity<Map<String, String>> debugPaths() {
        Map<String, String> paths = new HashMap<>();
        paths.put("uploadDir", uploadDir);
        paths.put("absoluteUploadDir", new java.io.File(uploadDir).getAbsolutePath());
        paths.put("serverTime", new java.util.Date().toString());
        paths.put("status", "ACTIVE");
        return ResponseEntity.ok(paths);
    }
}
