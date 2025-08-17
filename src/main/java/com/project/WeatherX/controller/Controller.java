package com.project.WeatherX.controller;


import com.project.WeatherX.dto.WeatherForeCast;
import com.project.WeatherX.dto.WeatherResponse;
import com.project.WeatherX.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/weather")
public class Controller {
    @Autowired
    private WeatherService service;

    @GetMapping("/{city}")
    public String getWeatherData(@PathVariable String city)
    {
        return service.test();
    }

    @GetMapping("/my/{city}")
    public WeatherResponse getWeather(@PathVariable String city)
    {
        return service.getData(city);
    }

    @GetMapping("/forecast")
    public WeatherForeCast getForecast(@RequestParam String city, @RequestParam int days)
    {
        return service.getForeCast(city,days);
    }
}
