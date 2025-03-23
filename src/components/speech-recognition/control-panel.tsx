'use client'

import React from 'react'
import { AddContext } from '@/components/add-context'
import { AddTranslation } from '@/components/add-translation'
// import { SnowflakeIcon } from 'lucide-react'
// import { Button } from '../ui/button'
// import { Clock } from 'lucide-react';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ControlPanelProps {
  utteranceInterval: number
  onUtteranceIntervalChange: (interval: number) => void
  onExternalIntervalChange?: (interval: number) => void
  onTranslationLanguageSelect?: (language: string | null) => void
}

/**
 * Component to manage control settings for speech recognition, including
 * utterance intervals and additional actions
 */
export const ControlPanel: React.FC<ControlPanelProps> = ({
  // utteranceInterval,
  // onUtteranceIntervalChange,
  // onExternalIntervalChange,
  onTranslationLanguageSelect,
}) => {
  // const handleIntervalChange = (value: string) => {
  //     const interval = parseInt(value, 10);
  //     onUtteranceIntervalChange(interval);
  //     if (onExternalIntervalChange) {
  //         onExternalIntervalChange(interval);
  //     }
  //     console.log(`Utterance interval set to ${interval}`);
  // };

  return (
    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
      <div className="flex flex-row gap-2 flex-wrap">
        {/* 発話間隔設定コントロール */}
        {/* <div className="flex items-center gap-2">
                    <div>
                        <Select
                            value={utteranceInterval.toString()}
                            onValueChange={handleIntervalChange}
                        >
                            <SelectTrigger>
                                <Clock />
                                <SelectValue placeholder="発話頻度設定" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">毎回生成</SelectItem>
                                <SelectItem value="2">2回に1回</SelectItem>
                                <SelectItem value="3">3回に1回</SelectItem>
                                <SelectItem value="5">5回に1回</SelectItem>
                                <SelectItem value="10">10回に1回</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div> */}
        <div className="flex flex-row items-center gap-2">
          <AddContext />
          {/* <Button variant="outline">
            <SnowflakeIcon />アイスブレイク
          </Button> */}
          <AddTranslation
            onTranslationLanguageSelect={
              onTranslationLanguageSelect || (() => { })
            }
          />
        </div>
      </div>
    </div>
  )
}
