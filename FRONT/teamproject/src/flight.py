import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import json

# ===== 사용자 설정 변수 (Playwright 실행에 사용) =====
DEPARTURE_AP = "SEL"
ARRIVAL_AP = "TYO"
DEPART_DATE = "20251110"
RETURN_DATE = "20251120"
ADULT_COUNT = 1
# ====================================================

# 🚨 개별 항공편 항목의 셀렉터 (정확함)
FLIGHT_ITEM_SELECTOR = '.combination_ConcurrentItemContainer__uUEbl'
MAX_FLIGHT_COUNT = 400

async def crawl_and_parse_flights():
# URL 생성 로직
    base_url = "https://flight.naver.com/flights/international/"
    itinerary_path = f"{DEPARTURE_AP}-{ARRIVAL_AP}-{DEPART_DATE}/{ARRIVAL_AP}-{DEPARTURE_AP}-{RETURN_DATE}"
    final_url = f"{base_url}{itinerary_path}?adult={ADULT_COUNT}&fareType=Y"
    
    flight_data_list = [] # 추출된 데이터를 저장할 리스트

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True) # 추출 시에는 headless=True가 빠르고 좋습니다.
        page = await browser.new_page()

        try:
            await page.goto(final_url, timeout=60000)
            await page.wait_for_selector(FLIGHT_ITEM_SELECTOR, timeout=30000) 
            await page.wait_for_timeout(1000) 
            
            # 페이지의 전체 HTML 콘텐츠 가져오기
            html_content = await page.content()
            
            # BeautifulSoup으로 HTML 파싱 시작
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # 1. 모든 개별 항공편 항목 찾기
            all_flight_items = soup.select(FLIGHT_ITEM_SELECTOR)
            flight_items = all_flight_items[:MAX_FLIGHT_COUNT]
            
            for item in flight_items:
                data = {}
                
                # 2. 항공사 이름 추출
                # item_ItemHeader__2fM4z > airline_Airlines__5_z0a > airline_text__WWkbY > airline_name__0Tw5w
                airline_tag = item.select_one('.airline_name__0Tw5w')
                data['airline'] = airline_tag.get_text().strip() if airline_tag else 'N/A'
                
                # 3. 가격 추출
                # item_ItemPriceList__pAvJJ > item_summary__YgDrL > item_num__aKbk4
                price_tag = item.select_one('.item_num__aKbk4')
                price_text = price_tag.get_text().replace(',', '').strip() if price_tag else '0'
                data['priceKRW'] = int(price_text)
                
                # 4. 여정 정보 추출 (시간, 공항 코드)
                routes = item.select('.route_Route__HYsDn') # 왕편/복편 여정 두 개
                if len(routes) >= 2:
                    # 왕편 (출발 -> 도착)
                    depart_time_tag = routes[0].select_one('.route_time__xWu7a')
                    arrive_time_tag = routes[0].select_one('.route_airport__tBD9o:nth-child(2) .route_time__xWu7a')
                    
                    data['departureTime'] = depart_time_tag.get_text().strip() if depart_time_tag else 'N/A'
                    data['arrivalTime'] = arrive_time_tag.get_text().strip() if arrive_time_tag else 'N/A'
                    
                    # 복편 (도착 -> 출발)
                    return_depart_time_tag = routes[1].select_one('.route_time__xWu7a')
                    return_arrive_time_tag = routes[1].select_one('.route_airport__tBD9o:nth-child(2) .route_time__xWu7a')

                    data['returnDepartureTime'] = return_depart_time_tag.get_text().strip() if return_depart_time_tag else 'N/A'
                    data['returnArrivalTime'] = return_arrive_time_tag.get_text().strip() if return_arrive_time_tag else 'N/A'

                flight_data_list.append(data)

            # 5. 결과 출력
            print(json.dumps(flight_data_list, indent=4, ensure_ascii=False))
            
        except Exception as e:
            print(f"ERROR: 크롤링 및 파싱 중 오류 발생: {e}")
        
        finally:
            await browser.close()

if __name__ == "__main__":
    # 🚨 인코딩 문제를 해결하기 위해 VS Code 실행 시 'python -X utf8' 명령어를 사용해 주세요.
    # python -X utf8 FRONT/teamproject/src/flight.py
    asyncio.run(crawl_and_parse_flights())