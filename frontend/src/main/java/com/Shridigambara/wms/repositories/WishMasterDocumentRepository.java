package com.Shridigambara.wms.repositories;

import com.Shridigambara.wms.entities.WishMasterDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WishMasterDocumentRepository extends JpaRepository<WishMasterDocument, Long> {
    List<WishMasterDocument> findByWishMasterId(Long wishMasterId);
}
