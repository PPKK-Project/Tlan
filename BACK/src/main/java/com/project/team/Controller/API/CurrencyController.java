package com.project.team.Controller.API;



import com.fasterxml.jackson.databind.JsonNode;
import com.project.team.Service.API.CurrencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class CurrencyController {

    private final CurrencyService currencyService;

    @GetMapping("/api/currency")
    public Mono<JsonNode> getRates() {
        return currencyService.fetchRates();
    }
}