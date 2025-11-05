package com.project.team.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Embassy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String embassyNm;

    private String embassyCd;

    private String embassyAddr;

    private String telNo;

    private String embassyKorNm;

    public Embassy(String embassyNm, String embassyCd, String embassyAddr, String telNo, String embassyKorNm) {
        this.embassyNm = embassyNm;
        this.embassyCd = embassyCd;
        this.embassyAddr = embassyAddr;
        this.telNo = telNo;
        this.embassyKorNm = embassyKorNm;
    }
}
