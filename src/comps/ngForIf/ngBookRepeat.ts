/**
 * Credits to: https://www.ng-book.com/2/ ng2-book
 * plubkr: https://plnkr.co/edit/Wx2Q3OqbPcgIc5d8GoFT?p=preview
 **/

import {
    Component,
    Directive,
    Input,
    ChangeDetectorRef,
    ViewRef,
    ViewContainerRef,
    TemplateRef,
    DoCheck,
    IterableDiffers,
    IterableDiffer,
} from '@angular/core';


@Directive({
    selector: '[ngBookRepeat]',
    inputs: ['ngBookRepeatOf']
})
export class ngBookRepeat implements DoCheck {
    private items:any;
    private differ:IterableDiffer;
    private views:Map<any, ViewRef> = new Map<any, ViewRef>();


    constructor(private viewContainer:ViewContainerRef,
                private template:TemplateRef<any>,
                private changeDetector:ChangeDetectorRef,
                private differs:IterableDiffers) {
    }
    private _context: Object;

    @Input()
    set ngOutletContext(context: Object) {
        if (this._context !== context) {
            this._context = context;
        }
    }

    set ngBookRepeatOf(items) {
        this.items = items;
        if (this.items && !this.differ) {
            this.differ = this.differs.find(items).create(this.changeDetector);
        }
    }

    ngDoCheck():void {
        if (this.differ) {
            let changes = this.differ.diff(this.items);
            if (changes) {
                console.log('template', this.template);
                changes.forEachAddedItem((change) => {
                    let view = this.viewContainer.createEmbeddedView(this.template, {$implicit: change.item}, change.currentIndex);
                    // view.context.$implicit = change.item;  // removed as no need in rc.3+
                    this.views.set(change.item, view);
                });
                changes.forEachRemovedItem((change) => {
                    let view = this.views.get(change.item);
                    let idx = this.viewContainer.indexOf(view);
                    this.viewContainer.remove(idx);
                    this.views.delete(change.item);
                });
            }
        }
    }
}

@Component({
    selector: 'ngBookRepeatSample',
    directives: [ngBookRepeat],
    styles: [`
        .ele {
            width: 200px;
        }
    `],
    template: `
  <ul>
    <li *ngBookRepeat="let p of people">
      {{ p.name }} is {{ p.age }}
      <a class="btn" href (click)="remove(p)">Remove</a>
    </li>
  </ul>

  <div class="ui form">
    <div class="fields">
      <div class="field">
        <input type="text" class="ele" #name placeholder="Name">
      </div>
      <div class="field">
        <input type="text" class="ele" #age placeholder="Age">
      </div>
    </div>
  </div>
  <button class="ele btn submit button"
       (click)="add(name, age)">
    Add
  </button>
  `
})
export class ngBookRepeatSample {
    people:any[];

    constructor() {
        this.people = [
            {name: 'Joe', age: 10},
            {name: 'Patrick', age: 21},
            {name: 'Melissa', age: 12},
            {name: 'Kate', age: 19}
        ];
    }

    remove(p) {
        let idx:number = this.people.indexOf(p);
        this.people.splice(idx, 1);
        return false;
    }

    add(name, age) {
        this.people.push({name: name.value, age: age.value});
        name.value = '';
        age.value = '';
    }
}


