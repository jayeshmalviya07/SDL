package com.Shridigambara.wms.controller;

import com.Shridigambara.wms.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/document")
    public ResponseEntity<Map<String, String>> uploadDocument(@RequestParam("file") MultipartFile file) {
        String path = fileStorageService.storeFile(file, "documents");
        return ResponseEntity.ok(Map.of("fileUrl", path));
    }

    @PostMapping("/screenshot")
    public ResponseEntity<Map<String, String>> uploadScreenshot(@RequestParam("file") MultipartFile file) {
        String path = fileStorageService.storeFile(file, "screenshots");
        return ResponseEntity.ok(Map.of("fileUrl", path));
    }
}
