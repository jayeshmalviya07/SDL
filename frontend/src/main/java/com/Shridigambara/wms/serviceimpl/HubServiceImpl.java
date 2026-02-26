package com.Shridigambara.wms.serviceimpl;

import com.Shridigambara.wms.entities.Hub;
import com.Shridigambara.wms.exceptions.BadRequestException;
import com.Shridigambara.wms.exceptions.ResourceNotFoundException;
import com.Shridigambara.wms.repositories.HubRepository;
import com.Shridigambara.wms.requestdto.HubRequestDto;
import com.Shridigambara.wms.responsedto.HubResponseDto;
import com.Shridigambara.wms.service.HubService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HubServiceImpl implements HubService {

    private final HubRepository hubRepository;

    @Override
    public HubResponseDto createHub(HubRequestDto request) {
        if (hubRepository.existsByHubId(request.getHubId())) {
            throw new BadRequestException("Hub ID already exists");
        }
        Hub hub = Hub.builder()
                .hubId(request.getHubId())
                .name(request.getName())
                .city(request.getCity())
                .area(request.getArea())
                .build();
        hub = hubRepository.save(hub);
        return toDto(hub);
    }

    @Override
    public HubResponseDto getById(Long id) {
        Hub hub = hubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hub not found"));
        return toDto(hub);
    }

    @Override
    public HubResponseDto getByHubId(String hubId) {
        Hub hub = hubRepository.findByHubId(hubId)
                .orElseThrow(() -> new ResourceNotFoundException("Hub not found"));
        return toDto(hub);
    }

    @Override
    public List<HubResponseDto> getAllHubs() {
        return hubRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public void deleteHub(Long id) {
        if (!hubRepository.existsById(id)) {
            throw new ResourceNotFoundException("Hub not found");
        }
        hubRepository.deleteById(id);
    }

    private HubResponseDto toDto(Hub hub) {
        return HubResponseDto.builder()
                .id(hub.getId())
                .hubId(hub.getHubId())
                .name(hub.getName())
                .city(hub.getCity())
                .area(hub.getArea())
                .build();
    }
}
