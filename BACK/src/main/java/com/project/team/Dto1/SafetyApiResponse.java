package com.project.team.Dto1;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
@Getter
public class SafetyApiResponse {

    // 1. 최상위 'response' 키를 받는 필드
    @JsonProperty("response")
    private ResponseData response;

    // 2. 'response' 객체 내부를 담는 중첩 클래스 (header, body)
    @Getter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ResponseData {

        @JsonProperty("header")
        private Header header; // API 응답 코드를 확인하기 위해 추가

        @JsonProperty("body")
        private Body body;
    }

    // (디버깅용) Header 클래스
    @Getter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Header {
        @JsonProperty("resultCode")
        private String resultCode;
        @JsonProperty("resultMsg")
        private String resultMsg;
    }

    @Getter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Body {

        @JsonProperty("items")
        private Items items;
    }

    @Getter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Items {

        @JsonProperty("item")
        private List<CountrySafetyInfo> item; // 여기가 실제 국가 리스트
    }

    @Getter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CountrySafetyInfo {

        @JsonProperty("country_name")
        private String countryName;

        @JsonProperty("continent")
        private String continent;

        @JsonProperty("attention")
        private String attention; // 1단계

        @JsonProperty("control")
        private String control; // 2단계

        @JsonProperty("limita")
        private String limita; // 3단계

        @JsonProperty("ban_yna")
        private String banYna; // 4단계

        public int getAlarmLevel() {
            // null이나 빈 문자열이 아니면 해당 레벨로 판단
            if (banYna != null && !banYna.isEmpty()) return 4;
            if (limita != null && !limita.isEmpty()) return 3;
            if (control != null && !control.isEmpty()) return 2;
            if (attention != null && !attention.isEmpty()) return 1;
            return 0; // 경보 없음
        }
    }
}