import React, { useState } from "react";
import { ScrollView, RefreshControl, StyleProp, ViewStyle } from "react-native";

interface Props {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  showsVerticalScrollIndicator?: boolean;
}

export default function RefreshableScrollView({
  children,
  onRefresh,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
}: Props) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={style}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={["#E95D91"]}
          tintColor="#E95D91"
        />
      }
    >
      {children}
    </ScrollView>
  );
}
