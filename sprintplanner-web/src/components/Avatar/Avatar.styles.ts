import styled from '@emotion/styled';

export const StyledAvatar = styled.div<{ $size: number; $color: string }>`
  width: ${p => p.$size}px;
  height: ${p => p.$size}px;
  border-radius: 50%;
  background: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${p => p.$size * 0.4}px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const S = { StyledAvatar };
