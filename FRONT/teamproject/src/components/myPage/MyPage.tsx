import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import TravelPlanList from "./TravelPlanList"

const queryClient = new QueryClient();

function MyPage(){

  return(
  <>
  <QueryClientProvider client={queryClient}>
    <TravelPlanList/>
    </QueryClientProvider>
  </>
  )
}
export default MyPage