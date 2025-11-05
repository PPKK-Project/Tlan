package com.project.team.Controller.API;



import com.fasterxml.jackson.databind.JsonNode;
import com.project.team.Service.API.CurrencyService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api")
public class CurrencyController {

    private final CurrencyService currencyService;

    public CurrencyController(CurrencyService currencyService) {
        this.currencyService = currencyService;
    }

    @GetMapping("/info/currency")
    public Mono<JsonNode> getRates() {

        return currencyService.fetchRates();
    }
}