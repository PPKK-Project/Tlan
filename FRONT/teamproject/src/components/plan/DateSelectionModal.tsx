import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onSave: (startDate: string, endDate: string) => void;
  initialStartDate: string;
  initialEndDate: string;
};

export function DateSelectionModal({
  open,
  onSave,
  initialStartDate,
  initialEndDate,
} : Props) {
  const [dates, setDates] = useState({
    startDate: initialStartDate,
    endDate: initialEndDate,
  });

  useEffect(() => {
    setDates({
      startDate: initialStartDate || "",
      endDate: initialEndDate || "",
    });
  }, [initialStartDate, initialEndDate]);

  const handleSaveClick = () => {
    if(!dates.startDate || !dates.endDate) {
      alert("날짜를 모두 선택해주세요.");
      return;
    }
    if(dates.startDate > dates.endDate) {
      alert("종료일은 시작일 이후여야 합니다.");
      return;
    }
    onSave(dates.startDate, dates.endDate);
  };

  return (
    <Dialog open={open} disableEscapeKeyDown>
      <DialogTitle>여행 기간을 선택해주세요 🗓️</DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-4 mt-2">
          <TextField
            label="시작일"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={dates.startDate}
            onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
          />
          <TextField
            label="종료일"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={dates.endDate}
            inputProps={{ min: dates.startDate }} // 시작일 이후만 선택 가능
            onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSaveClick} variant="contained" color="primary">
          일정 시작하기
        </Button>
      </DialogActions>
    </Dialog>
  );
}