package com.project.team.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Embassy {

    @Id
    @GeneratedValue(strategy =     GenerationType.IDENTITY)
    private Long id;

    private String embassyNm;

    private String embassyCd;

    private String embassyAddr;

    private String telNo;

    private String embassyKorNm;

}
