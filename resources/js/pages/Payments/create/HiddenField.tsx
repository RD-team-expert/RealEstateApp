import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';


interface HiddenFieldProps {
    isHidden: boolean;
    onHiddenChange: (value: boolean) => void;
}


export function HiddenField({ isHidden, onHiddenChange }: HiddenFieldProps) {
    return (
        <div className="rounded-lg border-l-4 border-l-yellow-500 p-4">
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="is_hidden"
                    checked={isHidden}
                    onCheckedChange={(checked) => onHiddenChange(checked as boolean)}
                />
                <Label htmlFor="is_hidden" className="text-base font-semibold cursor-pointer">
                    Hide Payment
                </Label>
                <p className="text-xs text-muted-foreground ml-2">(Hidden from default view)</p>
            </div>
        </div>
    );
}
