import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export function FaqMain() {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '800px',
        mx: 'auto',
        p: 3,
      }}
    >
      <Typography variant="h5" sx={{ mb: 4 }}>
        자주 묻는 질문
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>서비스 이용 방법이 궁금해요</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>서비스 이용 방법에 대한 상세한 설명이 들어갑니다.</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>요금제는 어떻게 되나요?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>요금제 관련 상세 설명이 들어갑니다.</Typography>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 4 }} />
      <Typography variant="h5" sx={{ mb: 4 }}>
        약관 및 정책
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>개인정보 처리방침</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary">
            서비스 이용약관에 대한 내용이 들어갑니다.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>이용약관</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary">
            서비스 이용약관에 대한 내용이 들어갑니다.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
