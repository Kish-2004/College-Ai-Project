package com.example.vehicledamage.dto;



import com.example.vehicledamage.model.LineItem;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class LineItemDto {
    private String part;
    private String damageType;
    private String action;
    private BigDecimal amount;

    public static LineItemDto fromLineItem(LineItem lineItem) {
        LineItemDto dto = new LineItemDto();
        dto.setPart(lineItem.getPart());
        dto.setDamageType(lineItem.getDamageType());
        dto.setAction(lineItem.getAction());
        dto.setAmount(lineItem.getAmount());
        return dto;
    }
}
