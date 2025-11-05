import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';


interface HiddenFieldProps {
    data: any;
    setData: (data: any) => void;
}


export default function HiddenField({ data, setData }: HiddenFieldProps) {
    return (
        <div className="rounded-lg border-l-4 border-l-yellow-500 p-4">
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="is_hidden"
                    checked={data.is_hidden}
                    onCheckedChange={(checked) => setData((prev: any) => ({ ...prev, is_hidden: checked as boolean }))}
                />
                <Label htmlFor="is_hidden" className="text-base font-semibold cursor-pointer">
                    Hide Payment
                </Label>
                <p className="text-xs text-muted-foreground ml-2">(Hidden from default view)</p>
            </div>
        </div>
    );
}
